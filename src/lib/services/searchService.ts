import type {
  Difficulty,
  IntentAnalysis,
  MatchReason,
  PromptRecord,
  ScoredPrompt,
  SearchFilters,
  SortOption,
} from "@/lib/types";
import { MATCH_CONFIG } from "@/lib/config/thresholds";
import {
  cosineSimilarity,
  embeddingIndex,
  promptToDocument,
} from "./embeddingService";
import { parseIntent } from "./intentService";
import { contentTokens } from "./textUtils";
import { promptRepo } from "@/lib/db/repositories";

/**
 * SearchService — hybrid retrieval.
 *
 *   keyword search  +  semantic/vector search  +  structured metadata scoring
 *
 * Providers are replaceable: embeddings behind `embeddingService`, the corpus
 * behind repositories. Nothing here knows about any vendor.
 */

// ---------- Structured scoring ----------

function taskOverlap(intentTasks: string[], promptTasks: string[]): number {
  if (intentTasks.length === 0 || promptTasks.length === 0) return 0.5;
  const set = new Set(promptTasks);
  const hits = intentTasks.filter((t) => set.has(t)).length;
  // Partial credit for adjacent tasks handled upstream via synonyms.
  return hits / intentTasks.length;
}

const TASK_SYNONYMS: Record<string, string[]> = {
  detect: ["review", "analyze"],
  recommend: ["analyze", "improve", "fix"],
  fix: ["debug", "recommend", "refactor"],
  quiz: ["assess", "explain", "convert"],
  extract: ["summarize", "analyze"],
  convert: ["rewrite", "extract", "write"],
  write: ["brainstorm"],
};

function taskMatchScore(intentTasks: string[], promptTasks: string[]): number {
  const direct = taskOverlap(intentTasks, promptTasks);
  if (direct >= 0.5) return direct;
  const pSet = new Set(promptTasks);
  let softHits = 0;
  for (const t of intentTasks) {
    const syn = TASK_SYNONYMS[t] ?? [];
    if (syn.some((s) => pSet.has(s))) softHits += 0.5;
  }
  const intentN = intentTasks.length || 1;
  return Math.min(1, direct + softHits / intentN);
}

export function structuredScore(
  intent: IntentAnalysis,
  p: PromptRecord,
  popularityMax: number,
): number {
  const w = MATCH_CONFIG.structuredWeights;

  const task = taskMatchScore(
    intent.tasks.map((t) => t.task),
    p.tasks,
  );

  const category =
    intent.category == null ? 0.6 : p.category === intent.category ? 1 : 0.25;

  const inputCompat =
    intent.inputType == null
      ? 0.7
      : p.inputType === intent.inputType
        ? 1
        : p.inputType === "text"
          ? 0.55
          : 0.15;

  const outputCompat =
    intent.outputType == null
      ? 0.7
      : p.outputType === intent.outputType
        ? 1
        : 0.3;

  const platformCompat =
    intent.platform == null
      ? 0.75
      : p.platforms.includes(intent.platform)
        ? 1
        : 0.2;

  const quality = p.qualityScore;
  const popularity =
    popularityMax > 0 ? Math.log10(1 + p.usageCount) / Math.log10(1 + popularityMax) : 0.5;

  return (
    w.taskMatch * task +
    w.categoryMatch * category +
    w.inputCompat * inputCompat +
    w.outputCompat * outputCompat +
    w.platformCompat * platformCompat +
    w.quality * quality +
    w.popularity * popularity
  );
}

// ---------- Keyword scoring ----------

interface DocTerms {
  terms: Set<string>;
  titleTerms: string[];
  tagTerms: string[];
}

const docTermCache = new WeakMap<PromptRecord, DocTerms>();

function docTerms(p: PromptRecord): DocTerms {
  const cached = docTermCache.get(p);
  if (cached) return cached;
  const terms = new Set(contentTokens(promptDocText(p)));
  const d: DocTerms = {
    terms,
    titleTerms: contentTokens(p.title),
    tagTerms: p.tags.flatMap((t) => contentTokens(t)),
  };
  docTermCache.set(p, d);
  return d;
}

function promptDocText(p: PromptRecord): string {
  return [p.title, p.description, p.tags.join(" "), p.tasks.join(" "), p.promptText].join(" ");
}

function keywordScore(queryTokens: string[], d: DocTerms): number {
  if (queryTokens.length === 0) return 0.5;
  let hits = 0;
  let titleHits = 0;
  let tagHits = 0;
  for (const t of queryTokens) {
    if (d.terms.has(t)) hits++;
    if (d.titleTerms.includes(t)) titleHits++;
    if (d.tagTerms.includes(t)) tagHits++;
  }
  const coverage = hits / queryTokens.length;
  const titleBonus = (titleHits / queryTokens.length) * 0.35;
  const tagBonus = (tagHits / queryTokens.length) * 0.3;
  return Math.min(1, coverage * 0.7 + titleBonus + tagBonus + 0.08);
}

// ---------- Public API ----------

export interface SearchOptions {
  filters?: SearchFilters;
  sort?: SortOption;
  limit?: number;
}

/** Apply hard metadata filters before ranking. */
export function applyFilters(prompts: PromptRecord[], f?: SearchFilters): PromptRecord[] {
  if (!f) return prompts;
  return prompts.filter((p) => {
    if (f.categories?.length && !f.categories.includes(p.category)) return false;
    if (f.subcategories?.length && !f.subcategories.includes(p.subcategory ?? "")) return false;
    if (f.difficulty?.length && !f.difficulty.includes(p.difficulty)) return false;
    if (f.platforms?.length && !f.platforms.some((pl) => p.platforms.includes(pl))) return false;
    if (f.task?.length && !f.task.some((t) => p.tasks.includes(t))) return false;
    if (f.inputType?.length && !f.inputType.includes(p.inputType)) return false;
    if (f.outputType?.length && !f.outputType.includes(p.outputType)) return false;
    if (f.minRating != null && p.rating < f.minRating) return false;
    if (f.minQuality != null && p.qualityScore < f.minQuality) return false;
    if (f.featuredOnly && !p.isFeatured) return false;
    return true;
  });
}

export function buildReasons(intent: IntentAnalysis, p: PromptRecord): MatchReason[] {
  const reasons: MatchReason[] = [];
  const shared = p.tasks.filter((t) => intent.tasks.map((i) => i.task).includes(t));
  if (shared.length > 0) {
    reasons.push({ label: "Task alignment", detail: `Covers ${shared.join(" + ")}` });
  }
  if (intent.category && p.category === intent.category) {
    reasons.push({ label: "Domain", detail: `Same domain (${p.category})` });
  }
  if (intent.inputType && p.inputType === intent.inputType) {
    reasons.push({ label: "Input fit", detail: `Handles ${p.inputType} input` });
  }
  if (intent.outputType && p.outputType === intent.outputType) {
    reasons.push({ label: "Output fit", detail: `Produces ${p.outputType}` });
  }
  if (p.rating >= 4.7) {
    reasons.push({ label: "Community proof", detail: `${p.rating.toFixed(1)}★ from ${p.ratingCount} users` });
  }
  if (p.usageCount > 2000) {
    reasons.push({ label: "Battle-tested", detail: `${p.usageCount.toLocaleString()} uses` });
  }
  return reasons.slice(0, 4);
}

// ---------- Scale-safe engine bootstrap ----------

let engineReady = false;
/** Train TF-IDF statistics once per process from a bounded corpus sample. */
export function ensureSemanticEngine(): void {
  if (engineReady) return;
  const sample = promptRepo.embeddingSample(6000);
  embeddingIndex.ensureTrainedDocs(
    sample.map(promptToDocument),
    `sample:${sample.length}`,
  );
  engineReady = true;
}

/**
 * Eagerly initialise the semantic engine on import so the first request
 * doesn't pay the cold-start cost (embedding training + FTS warm-up).
 * Module-level side-effect is safe because the DB singleton and embedding
 * index are both process-scoped.
 */
try {
  ensureSemanticEngine();
} catch {
  /* best-effort: will retry on first search */
}

/** Significant normalized tokens pushed down to full-text retrieval. */
function retrievalTokens(rawQuery: string): string[] {
  return contentTokens(rawQuery).filter((t) => t.length >= 2).slice(0, 8);
}

/**
 * Rank prompts for an intent using the hybrid model and return calibrated
 * scored results in rank order.
 *
 * Retrieval pushes filtering, text match and base ordering into SQLite
 * (FTS5), then re-ranks only a bounded candidate set (~1200) with the full
 * hybrid model. Stays fast at hundreds of thousands of prompts.
 */
export function searchPrompts(
  queryOrIntent: string | IntentAnalysis,
  opts: SearchOptions = {},
): { results: ScoredPrompt[]; intent: IntentAnalysis } {
  const intent =
    typeof queryOrIntent === "string" ? parseIntent(queryOrIntent) : queryOrIntent;

  ensureSemanticEngine();

  // Phase 1 — light candidate slice from SQLite (no fat columns), gated by
  // any filters that cannot push down to SQL.
  const candidates = promptRepo.candidatesFor({
    tokens: retrievalTokens(intent.rawQuery),
    filters: opts.filters,
    sort: opts.sort,
    limit: 1200,
  });
  const gated = applyFilters(candidates, opts.filters);
  if (gated.length === 0) return { results: [], intent };

  const queryTokens = contentTokens(intent.rawQuery);
  const popularityMax = promptRepo.popularityMax();

  // Semantic machinery shared by pre-scoring and final scoring.
  const qv = embeddingIndex.embedQueryText(queryToIndexText(intent));
  const semOf = (p: PromptRecord): number =>
    Math.min(
      1,
      cosineSimilarity(qv, embeddingIndex.embedDocText(promptToDocument(p))) / 0.45,
    );

  // Phase 2 — cheap pre-score on light rows, then hydrate the shortlist and
  // run the exact hybrid model with real bodies. Keeps heavy I/O bounded:
  // ~1200 narrow rows read, ~90 wide rows fetched per request.
  let pool: PromptRecord[];
  if (opts.sort && opts.sort !== "relevance") {
    pool = promptRepo.byIds(gated.slice(0, 90).map((p) => p.id));
    const order = new Map(pool.map((p) => [p.id, p]));
    pool = gated.slice(0, 90).map((p) => order.get(p.id)!).filter(Boolean);
  } else {
    const ranked = gated
      .map((p) => ({
        p,
        s:
          MATCH_CONFIG.weights.semantic * semOf(p) +
          MATCH_CONFIG.weights.keyword * keywordScore(queryTokens, docTerms(p)) +
          MATCH_CONFIG.weights.structured * structuredScore(intent, p, popularityMax),
      }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 90);
    const hydrated = promptRepo.byIds(ranked.map(({ p }) => p.id));
    const byId = new Map(hydrated.map((p) => [p.id, p]));
    pool = ranked.map(({ p }) => byId.get(p.id)).filter((x): x is PromptRecord => !!x);
  }
  const { semantic: ws, keyword: wk, structured: wst } = MATCH_CONFIG.weights;

  const scored: ScoredPrompt[] = pool.map((p) => {
    const semantic = semOf(p);
    const keyword = keywordScore(queryTokens, docTerms(p));
    const structured = structuredScore(intent, p, popularityMax);

    const raw = ws * semantic + wk * keyword + wst * structured;
    const { center, scale } = MATCH_CONFIG.calibration;
    const calibrated = 1 / (1 + Math.exp(-(raw - center) / scale));

    return {
      prompt: p,
      score: calibrated,
      semantic,
      keyword,
      structured,
      reasons: buildReasons(intent, p),
    };
  });

  scored.sort((a, b) => b.score - a.score);

  // Non-relevance sorts reorder within the same filter pool.
  if (opts.sort && opts.sort !== "relevance") {
    const cmp: Record<Exclude<SortOption, "relevance">, (a: ScoredPrompt, b: ScoredPrompt) => number> = {
      popular: (a, b) => b.prompt.usageCount - a.prompt.usageCount,
      rating: (a, b) => b.prompt.rating - a.prompt.rating,
      recent: (a, b) => b.prompt.createdAt.localeCompare(a.prompt.createdAt),
      quality: (a, b) => b.prompt.qualityScore - a.prompt.qualityScore,
    };
    scored.sort(cmp[opts.sort]);
  }

  return { results: scored.slice(0, opts.limit ?? MATCH_CONFIG.search.topK), intent };
}

function queryToIndexText(intent: IntentAnalysis): string {
  // Enrich the retrieval text with extracted structure so vector search sees
  // the same signals the structured scorer does.
  return [
    intent.rawQuery,
    intent.domain ?? "",
    intent.tasks.map((t) => t.task).join(" "),
    intent.inputType ?? "",
    intent.outputType ?? "",
  ]
    .filter(Boolean)
    .join(". ");
}

export function difficultyLabel(d: Difficulty): string {
  return d.charAt(0).toUpperCase() + d.slice(1);
}
