import type {
  CategoryRecord,
  CommandRecord,
  Difficulty,
  PlatformRecord,
  PromptRecord,
  PromptStatus,
  PromptVariable,
  SearchFilters,
  SortOption,
  WorkflowRecord,
} from "@/lib/types";
import { query, queryOne, run } from "./connection";
import { buildSearchText } from "./searchText";

// ---------- Row mapping ----------

interface PromptRow {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string | null;
  tasks: string;
  tags: string;
  difficulty: string;
  prompt_text: string;
  variables: string;
  input_type: string;
  output_type: string;
  purpose: string | null;
  transformation: string | null;
  tone: string | null;
  best_for: string;
  platforms: string;
  platform_adaptations: string;
  quality_score: number;
  usage_count: number;
  rating: number;
  rating_count: number;
  author: string;
  status: string;
  source: string;
  is_featured: number;
  created_at: string;
  updated_at: string;
}

function parseJson<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

export function rowToPrompt(r: PromptRow): PromptRecord {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    subcategory: r.subcategory,
    tasks: parseJson<string[]>(r.tasks, []),
    tags: parseJson<string[]>(r.tags, []),
    difficulty: r.difficulty as Difficulty,
    promptText: r.prompt_text,
    variables: parseJson<PromptVariable[]>(r.variables, []),
    inputType: r.input_type,
    outputType: r.output_type,
    purpose: r.purpose,
    transformation: r.transformation,
    tone: r.tone,
    bestFor: parseJson<string[]>(r.best_for, []),
    platforms: parseJson<string[]>(r.platforms, []),
    platformAdaptations: parseJson<Record<string, string>>(r.platform_adaptations, {}),
    qualityScore: r.quality_score,
    usageCount: r.usage_count,
    rating: r.rating,
    ratingCount: r.rating_count,
    author: r.author,
    status: r.status as PromptStatus,
    source: r.source as PromptRecord["source"],
    isFeatured: !!r.is_featured,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const PROMPT_COLS = `id, title, description, category, subcategory, tasks, tags, difficulty,
  prompt_text, variables, input_type, output_type, purpose, transformation, tone, best_for,
  platforms, platform_adaptations, quality_score, usage_count, rating, rating_count, author,
  status, source, is_featured, created_at, updated_at, search_text`;

// ---------- Prompts ----------

const popMaxCache: { value: number; at: number } = { value: 0, at: 0 };

/**
 * Tiny TTL cache for hot read-mostly aggregates (home page rails, counts).
 * The corpus is seed-static; only usage counters change, so a short TTL is
 * invisible to users while turning multi-second scans into memory reads.
 */
const ttlCache = new Map<string, { at: number; value: unknown }>();
function cached<T>(key: string, ttlMs: number, compute: () => T): T {
  const hit = ttlCache.get(key);
  const now = Date.now();
  if (hit && now - hit.at <= ttlMs) return hit.value as T;
  const value = compute();
  ttlCache.set(key, { at: now, value });
  return value;
}

/** JS mirror of the pushdown-able SQL filters, for the FTS id-pool path. */
type FilterableRow = Pick<
  PromptRow,
  "status" | "category" | "subcategory" | "difficulty" | "rating" | "quality_score" | "is_featured"
>;
function matchesJsFilters(r: FilterableRow, f?: SearchFilters): boolean {
  if (!f) return r.status === "published";
  if (r.status !== "published") return false;
  if (f.categories?.length && !f.categories.includes(r.category)) return false;
  if (f.subcategories?.length && !f.subcategories.includes(r.subcategory ?? "")) return false;
  if (f.difficulty?.length && !f.difficulty.includes(r.difficulty as Difficulty)) return false;
  if (f.minRating != null && r.rating < f.minRating) return false;
  if (f.minQuality != null && r.quality_score < f.minQuality) return false;
  if (f.featuredOnly && !r.is_featured) return false;
  return true;
}

/** JS sort mirrors for the non-relevance sorts on the FTS path. */
const JS_SORT_KEYS: Record<Exclude<SortOption, "relevance">, (r: PromptRow) => number> = {
  popular: (r) => r.usage_count,
  rating: (r) => r.rating,
  recent: (r) => new Date(r.created_at).getTime(),
  quality: (r) => r.quality_score,
};

/** Candidate columns — everything except the fat blobs (body, variables,
 * platform adaptations). Pre-scoring only needs text + metadata; full rows
 * are hydrated for the shortlisted few. */
const LIGHT_COLS = PROMPT_COLS.split(",")
  .map((c) => c.trim())
  .filter((c) => !"prompt_text variables platform_adaptations".split(" ").includes(c))
  .join(", ");

function rowToLight(r: PromptRow): PromptRecord {
  const rec = rowToPrompt(r);
  rec.promptText = "";
  rec.variables = [];
  rec.platformAdaptations = {};
  return rec;
}

const SORT_ORDERS: Record<SortOption, string> = {
  relevance: "p.usage_count DESC",
  popular: "p.usage_count DESC",
  rating: "p.rating DESC",
  recent: "p.created_at DESC",
  quality: "p.quality_score DESC",
};

let ftsCache: boolean | undefined;
function ftsAvailable(): boolean {
  if (ftsCache === undefined) {
    ftsCache = !!queryOne(
      `SELECT 1 FROM sqlite_master WHERE type='table' AND name='prompts_fts'`,
    );
  }
  return ftsCache;
}

export const promptRepo = {
  byId(id: string): PromptRecord | undefined {
    const row = queryOne<PromptRow>(
      `SELECT ${PROMPT_COLS} FROM prompts WHERE id = ?`,
      id,
    );
    return row ? rowToPrompt(row) : undefined;
  },

  allPublished(): PromptRecord[] {
    return query<PromptRow>(
      `SELECT ${PROMPT_COLS} FROM prompts WHERE status = 'published'`,
    ).map(rowToPrompt);
  },

  trending(limit = 8): PromptRecord[] {
    return cached(`trending:${limit}`, 120_000, () =>
      query<PromptRow>(
        `SELECT ${PROMPT_COLS} FROM prompts WHERE status = 'published'
         ORDER BY usage_count * (0.5 + rating / 5) DESC LIMIT ?`,
        limit,
      ).map(rowToPrompt),
    );
  },

  recent(limit = 8): PromptRecord[] {
    return cached(`recent:${limit}`, 120_000, () =>
      query<PromptRow>(
        `SELECT ${PROMPT_COLS} FROM prompts WHERE status = 'published'
         ORDER BY created_at DESC LIMIT ?`,
        limit,
      ).map(rowToPrompt),
    );
  },

  featured(limit = 4): PromptRecord[] {
    return cached(`featured:${limit}`, 120_000, () =>
      query<PromptRow>(
        `SELECT ${PROMPT_COLS} FROM prompts WHERE status = 'published' AND is_featured = 1
         ORDER BY usage_count DESC LIMIT ?`,
        limit,
      ).map(rowToPrompt),
    );
  },

  countsByCategory(): Record<string, number> {
    return cached("countsByCategory", 120_000, () => {
      const rows = query<{ category: string; n: number }>(
        `SELECT category, COUNT(*) AS n FROM prompts WHERE status='published' GROUP BY category`,
      );
      return Object.fromEntries(rows.map((r) => [r.category, Number(r.n)]));
    });
  },

  /** Cheap aggregate used for popularity normalization (60s TTL cache). */
  popularityMax(): number {
    const now = Date.now();
    if (!popMaxCache.value || now - popMaxCache.at > 60_000) {
      const row = queryOne<{ usage_count: number }>(
        `SELECT usage_count FROM prompts WHERE status='published' ORDER BY usage_count DESC LIMIT 1`,
      );
      popMaxCache.value = Number(row?.usage_count ?? 0) || 1;
      popMaxCache.at = now;
    }
    return popMaxCache.value;
  },

  /** Hydrate full rows (bodies included) for a bounded id set. */
  byIds(ids: string[]): PromptRecord[] {
    if (ids.length === 0) return [];
    const placeholders = ids.map(() => "?").join(",");
    return query<PromptRow>(
      `SELECT ${PROMPT_COLS} FROM prompts WHERE id IN (${placeholders})`,
      ...ids,
    ).map(rowToPrompt);
  },

  /**
   * Scale-safe candidate retrieval. Instead of loading every published prompt
   * into JS, push filtering + text matching + ordering down to SQLite and
   * return only a bounded candidate set for hybrid re-ranking upstream.
   */
  candidatesFor(opts: {
    tokens?: string[];
    filters?: SearchFilters;
    sort?: SortOption;
    limit?: number;
    /** Fetch fat columns too (bodies/variables) — only for small sets. */
    full?: boolean;
  }): PromptRecord[] {
    const limit = Math.min(Math.max(opts.limit ?? 1200, 1), 5000);
    const cols = opts.full ? PROMPT_COLS : LIGHT_COLS;
    const map = opts.full
      ? (rows: PromptRow[]) => rows.map(rowToPrompt)
      : (rows: PromptRow[]) => rows.map(rowToLight);
    const where: string[] = [`p.status = 'published'`];
    const params: (string | number)[] = [];
    const f = opts.filters;

    if (f?.categories?.length) {
      where.push(`p.category IN (${f.categories.map(() => "?").join(",")})`);
      params.push(...f.categories);
    }
    if (f?.subcategories?.length) {
      where.push(`p.subcategory IN (${f.subcategories.map(() => "?").join(",")})`);
      params.push(...f.subcategories);
    }
    if (f?.difficulty?.length) {
      where.push(`p.difficulty IN (${f.difficulty.map(() => "?").join(",")})`);
      params.push(...f.difficulty);
    }
    if (f?.minRating != null) {
      where.push(`p.rating >= ?`);
      params.push(f.minRating);
    }
    if (f?.minQuality != null) {
      where.push(`p.quality_score >= ?`);
      params.push(f.minQuality);
    }
    if (f?.featuredOnly) {
      where.push(`p.is_featured = 1`);
    }

    const tokens = (opts.tokens ?? []).filter((t) => t.length >= 2).slice(0, 8);

    // Full-text path — millisecond retrieval even at hundreds of thousands
    // of rows. Deliberately skips SQL-side ranking (bm25 across tens of
    // thousands of matches costs ~500ms): pull a bounded id pool, fetch
    // narrow rows, and let the caller's scorer pick winners.
    if (tokens.length > 0 && ftsAvailable()) {
      const match = tokens.map((t) => `"${t.replace(/"/g, "")}"`).join(" OR ");
      const poolCap = Math.min(Math.max(limit * 4, 4000), 8000);
      const idRows = query<{ id: string }>(
        `SELECT id FROM prompts_fts WHERE prompts_fts MATCH ? LIMIT ${poolCap}`,
        match,
      );
      if (idRows.length === 0) return [];
      const cols = opts.full ? PROMPT_COLS : LIGHT_COLS;
      const map = opts.full
        ? (rows: PromptRow[]) => rows.map(rowToPrompt)
        : (rows: PromptRow[]) => rows.map(rowToLight);
      const rows: PromptRow[] = [];
      for (let i = 0; i < idRows.length; i += 500) {
        const chunk = idRows.slice(i, i + 500).map((r) => r.id);
        rows.push(
          ...query<PromptRow>(
            `SELECT ${cols} FROM prompts p WHERE p.id IN (${chunk.map(() => "?").join(",")})`,
            ...chunk,
          ),
        );
      }
      const filtered = rows.filter((r) => matchesJsFilters(r, f));
      if (opts.sort && opts.sort !== "relevance") {
        const key = JS_SORT_KEYS[opts.sort];
        filtered.sort((a, b) => key(b) - key(a));
      }
      return map(filtered.slice(0, limit));
    }

    // LIKE fallback when FTS is unavailable; also covers the no-token browse case.
    if (tokens.length > 0) {
      where.push(`(${tokens.map(() => `p.search_text LIKE ?`).join(" OR ")})`);
      params.push(...tokens.map((t) => `%${t}%`));
    }
    const order = SORT_ORDERS[opts.sort ?? "relevance"];
    const sql =
      `SELECT ${cols} FROM prompts p WHERE ${where.join(" AND ")} ORDER BY ${order} LIMIT ${limit}`;
    return map(query<PromptRow>(sql, ...params));
  },

  /**
   * Bounded corpus sample for TF-IDF training — full-corpus IDF statistics
   * are approximated from curated prompts plus the most-used generated ones.
   */
  embeddingSample(limit = 6000): PromptRecord[] {
    return query<PromptRow>(
      `SELECT ${PROMPT_COLS} FROM prompts WHERE status = 'published'
       ORDER BY (source = 'seed') DESC, usage_count DESC LIMIT ?`,
      Math.min(limit, 20000),
    ).map(rowToPrompt);
  },

  insert(p: PromptRecord): void {
    run(
      `INSERT INTO prompts (${PROMPT_COLS}) VALUES (${PROMPT_COLS.split(",").map(() => "?").join(",")})`,
      p.id, p.title, p.description, p.category, p.subcategory,
      JSON.stringify(p.tasks), JSON.stringify(p.tags), p.difficulty,
      p.promptText, JSON.stringify(p.variables), p.inputType, p.outputType,
      p.purpose, p.transformation, p.tone, JSON.stringify(p.bestFor),
      JSON.stringify(p.platforms), JSON.stringify(p.platformAdaptations),
      p.qualityScore, p.usageCount, p.rating, p.ratingCount, p.author,
      p.status, p.source, p.isFeatured ? 1 : 0, p.createdAt, p.updatedAt,
      buildSearchText({
        title: p.title,
        description: p.description,
        subcategory: p.subcategory,
        tags: p.tags,
        tasks: p.tasks,
        purpose: p.purpose,
        bestFor: p.bestFor,
        promptText: p.promptText,
      }),
    );
  },

  updateEditable(
    id: string,
    fields: Partial<
      Pick<
        PromptRecord,
        "title" | "description" | "promptText" | "tags" | "difficulty" | "updatedAt"
      >
    >,
  ): void {
    const sets: string[] = [];
    const vals: (string | number)[] = [];
    if (fields.title !== undefined) { sets.push("title=?"); vals.push(fields.title); }
    if (fields.description !== undefined) { sets.push("description=?"); vals.push(fields.description); }
    if (fields.promptText !== undefined) { sets.push("prompt_text=?"); vals.push(fields.promptText); }
    if (fields.tags !== undefined) { sets.push("tags=?"); vals.push(JSON.stringify(fields.tags)); }
    if (fields.difficulty !== undefined) { sets.push("difficulty=?"); vals.push(fields.difficulty); }
    sets.push("updated_at=?");
    vals.push(fields.updatedAt ?? new Date().toISOString());
    vals.push(id);
    run(`UPDATE prompts SET ${sets.join(", ")} WHERE id=?`, ...vals);
  },

  incrementUsage(id: string): void {
    run(`UPDATE prompts SET usage_count = usage_count + 1 WHERE id=?`, id);
  },
};

// ---------- Taxonomy ----------

export function listCategories(): CategoryRecord[] {
  const cats = query<{ id: string; name: string; icon: string; color: string; sort: number }>(
    `SELECT id, name, icon, color, sort FROM categories ORDER BY sort`,
  );
  const subs = query<{ category_id: string; name: string; id: string }>(
    `SELECT category_id, id, name FROM subcategories ORDER BY name`,
  );
  return cats.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    color: c.color,
    sort: c.sort,
    subcategories: subs.filter((s) => s.category_id === c.id).map((s) => s.name),
  }));
}

export function listPlatforms(): PlatformRecord[] {
  return query<PlatformRecord & { sort: number }>(
    `SELECT id, name, color, note, sort FROM platforms ORDER BY sort`,
  ).map(({ sort: _sort, ...p }) => p);
}

export function listCommands(): CommandRecord[] {
  return query<{ cmd: string; label: string; description: string; intent_patch: string }>(
    `SELECT cmd, label, description, intent_patch FROM commands ORDER BY cmd`,
  ).map((c) => ({ ...c, intentPatch: parseJson(c.intent_patch, {}) }));
}

// ---------- Workflows ----------

interface WorkflowRow {
  id: string;
  name: string;
  description: string;
  category: string | null;
  steps: string;
  usage_count: number;
  is_featured: number;
  author: string | null;
  created_at: string;
}

function rowToWorkflow(r: WorkflowRow): WorkflowRecord {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    category: r.category,
    steps: parseJson<WorkflowRecord["steps"]>(r.steps, []),
    usageCount: r.usage_count,
    isFeatured: !!r.is_featured,
    author: r.author,
    createdAt: r.created_at,
  };
}

export const workflowRepo = {
  list(): WorkflowRecord[] {
    return query<WorkflowRow>(
      `SELECT * FROM workflows ORDER BY is_featured DESC, usage_count DESC`,
    ).map(rowToWorkflow);
  },
  byId(id: string): WorkflowRecord | undefined {
    const row = queryOne<WorkflowRow>(`SELECT * FROM workflows WHERE id = ?`, id);
    return row ? rowToWorkflow(row) : undefined;
  },
  insert(w: Omit<WorkflowRecord, never>): void {
    run(
      `INSERT INTO workflows (id, name, description, category, steps, usage_count, is_featured, author, created_at)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      w.id, w.name, w.description, w.category, JSON.stringify(w.steps),
      w.usageCount, w.isFeatured ? 1 : 0, w.author, w.createdAt,
    );
  },
  incrementUsage(id: string): void {
    run(`UPDATE workflows SET usage_count = usage_count + 1 WHERE id=?`, id);
  },
};

// ---------- Analytics events ----------

export interface EventRowIn {
  type: string;
  promptId?: string | null;
  outcome?: string | null;
  meta?: Record<string, unknown>;
}

export const eventRepo = {
  log(e: EventRowIn): void {
    run(
      `INSERT INTO events (type, prompt_id, outcome, meta, created_at) VALUES (?,?,?,?,?)`,
      e.type, e.promptId ?? null, e.outcome ?? null,
      JSON.stringify(e.meta ?? {}), new Date().toISOString(),
    );
  },
};
