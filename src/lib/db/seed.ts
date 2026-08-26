import type { DatabaseSync } from "node:sqlite";
import type { PromptRecord } from "@/lib/types";
import { SEED_CATEGORIES } from "../seed/taxonomy";
import { SEED_PLATFORMS } from "../seed/platforms";
import { SEED_COMMANDS } from "../seed/commands";
import { CODING_PROMPTS } from "../seed/prompts/coding";
import { WRITING_RESEARCH_EDUCATION_PROMPTS } from "../seed/prompts/writing-research-education";
import { BUSINESS_MARKETING_FINANCE_LEGAL_PROMPTS } from "../seed/prompts/business-marketing-finance-legal";
import { PRODUCTIVITY_DATA_CAREER_PROMPTS } from "../seed/prompts/productivity-data-career";
import { MEDIA_MISC_PROMPTS } from "../seed/prompts/media-misc";
import { COVERAGE_PEOPLE_MEDIA_PROMPTS } from "../seed/prompts/coverage-people-media";
import { COVERAGE_WORK_PROMPTS } from "../seed/prompts/coverage-work-data";
import { generateSeedPrompt, deepenCuratedBody } from "../seed/generator";
import { SEED_WORKFLOWS } from "../seed/workflows";
import { buildSearchText } from "./searchText";
import type { SeedPrompt } from "../seed/promptTypes";

const ALL_SEED_PROMPTS: SeedPrompt[] = [
  ...CODING_PROMPTS,
  ...WRITING_RESEARCH_EDUCATION_PROMPTS,
  ...BUSINESS_MARKETING_FINANCE_LEGAL_PROMPTS,
  ...PRODUCTIVITY_DATA_CAREER_PROMPTS,
  ...MEDIA_MISC_PROMPTS,
  ...COVERAGE_PEOPLE_MEDIA_PROMPTS,
  ...COVERAGE_WORK_PROMPTS,
];

/** Volume of procedurally generated prompts. Override via env. */
function genTarget(): number {
  const raw = Number(process.env.PROMPTLY_GEN_TARGET);
  if (Number.isFinite(raw) && raw >= 0) return Math.floor(raw);
  return 220_000; // ~2.2 lakh generated + curated on top
}

const BATCH = 5_000;

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function seedPromptToRecord(s: SeedPrompt): PromptRecord {
  const created = daysAgoIso(s.ageDays);
  // Deterministic pseudo-quality from rating + usage so ranking feels real.
  const quality = Math.min(0.99, 0.55 + (s.rating / 5) * 0.35 + Math.min(s.usageCount, 6000) / 60000);
  return {
    id: s.id,
    title: s.title,
    description: s.description,
    category: s.category,
    subcategory: s.subcategory ?? null,
    tasks: s.tasks,
    tags: s.tags,
    difficulty: s.difficulty,
    promptText: s.body,
    variables: s.variables ?? [],
    inputType: s.inputType,
    outputType: s.outputType,
    purpose: s.purpose,
    transformation: s.transformation,
    tone: s.tone,
    bestFor: s.bestFor,
    platforms: s.platforms,
    platformAdaptations: {},
    qualityScore: Number(quality.toFixed(3)),
    usageCount: s.usageCount,
    rating: s.rating,
    ratingCount: s.ratingCount,
    author: s.author ?? "Promptly Editorial",
    status: "published",
    source: s.source ?? "seed",
    isFeatured: !!s.featured,
    createdAt: created,
    updatedAt: created,
  };
}

const PROMPT_COLS = [
  "id", "title", "description", "category", "subcategory", "tasks", "tags", "difficulty",
  "prompt_text", "variables", "input_type", "output_type", "purpose", "transformation",
  "tone", "best_for", "platforms", "platform_adaptations", "quality_score", "usage_count",
  "rating", "rating_count", "author", "status", "source", "is_featured", "created_at",
  "updated_at", "search_text",
] as const;

/** One prepared statement reused for every row — the key to fast bulk inserts. */
function makePromptInserter(db: DatabaseSync) {
  const insertPrompt = db.prepare(
    `INSERT INTO prompts (${PROMPT_COLS.join(",")}) VALUES (${PROMPT_COLS.map(() => "?").join(",")})`,
  );
  // Paired FTS write — valid because seeding drops the sync triggers first.
  const insertFts = db.prepare(`INSERT INTO prompts_fts (id, text) VALUES (?, ?)`);
  return (p: PromptRecord, searchText: string) => {
    insertPrompt.run(
      p.id, p.title, p.description, p.category, p.subcategory,
      JSON.stringify(p.tasks), JSON.stringify(p.tags), p.difficulty,
      p.promptText, JSON.stringify(p.variables), p.inputType, p.outputType,
      p.purpose, p.transformation, p.tone, JSON.stringify(p.bestFor),
      JSON.stringify(p.platforms), JSON.stringify(p.platformAdaptations),
      p.qualityScore, p.usageCount, p.rating, p.ratingCount, p.author,
      p.status, p.source, p.isFeatured ? 1 : 0, p.createdAt, p.updatedAt,
      searchText,
    );
      insertFts.run(p.id, searchText);
  };
}

const FTS_TRIGGERS_SQL = `
CREATE TRIGGER IF NOT EXISTS prompts_fts_insert AFTER INSERT ON prompts BEGIN
  INSERT INTO prompts_fts (id, text) VALUES (new.id, new.search_text);
END;
CREATE TRIGGER IF NOT EXISTS prompts_fts_delete AFTER DELETE ON prompts BEGIN
  DELETE FROM prompts_fts WHERE id = old.id;
END;
CREATE TRIGGER IF NOT EXISTS prompts_fts_update AFTER UPDATE OF search_text ON prompts BEGIN
  UPDATE prompts_fts SET text = new.search_text WHERE id = new.id;
END;
`;

export function seedDatabase(db: DatabaseSync): void {
  // Bulk-load mode: manual paired FTS writes instead of per-row triggers.
  db.exec(
    `DROP TRIGGER IF EXISTS prompts_fts_insert;
     DROP TRIGGER IF EXISTS prompts_fts_delete;
     DROP TRIGGER IF EXISTS prompts_fts_update;`,
  );

  const insertCat = db.prepare(
    `INSERT INTO categories (id, name, icon, color, sort) VALUES (?,?,?,?,?)`,
  );
  const insertSub = db.prepare(
    `INSERT INTO subcategories (id, category_id, name) VALUES (?,?,?)`,
  );
  SEED_CATEGORIES.forEach((c, i) => {
    insertCat.run(c.id, c.name, c.icon, c.color, i);
    c.subcategories.forEach((name) => {
      insertSub.run(name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), c.id, name);
    });
  });

  const insertPlatform = db.prepare(
    `INSERT INTO platforms (id, name, color, note, sort) VALUES (?,?,?,?,?)`,
  );
  SEED_PLATFORMS.forEach((p, i) => insertPlatform.run(p.id, p.name, p.color, p.note, i));

  const insertCommand = db.prepare(
    `INSERT INTO commands (cmd, label, description, intent_patch) VALUES (?,?,?,?)`,
  );
  for (const c of SEED_COMMANDS) {
    insertCommand.run(c.cmd, c.label, c.description, JSON.stringify(c.intentPatch));
  }

  const insertOne = makePromptInserter(db);

  // ---------- Curated prompts ----------
  db.exec("BEGIN");
  for (const seed of ALL_SEED_PROMPTS) {
    const p = seedPromptToRecord(seed);
    // Hand-written opening stays verbatim; deep sections appended for parity
    // with the procedural corpus (which averages ~5k chars).
    p.promptText = deepenCuratedBody(seed);
    insertOne(p, buildSearchText(p));
  }
  db.exec("COMMIT");

  // ---------- Generated corpus ----------
  const target = genTarget();
  if (target > 0) {
    const t0 = Date.now();
    let inserted = 0;
    db.exec("BEGIN");
    for (let i = 0; i < target; i++) {
      const p = seedPromptToRecord(generateSeedPrompt(i));
      insertOne(p, buildSearchText(p));
      inserted++;
      if (inserted % BATCH === 0) {
        db.exec("COMMIT");
        db.exec("BEGIN");
      }
    }
    db.exec("COMMIT");
    // eslint-disable-next-line no-console
    console.log(
      `[db] Generated ${inserted.toLocaleString()} procedural prompts in ${((Date.now() - t0) / 1000).toFixed(1)}s`,
    );
  }

  const insertWorkflow = db.prepare(
    `INSERT INTO workflows (id, name, description, category, steps, usage_count, is_featured, author, created_at)
     VALUES (?,?,?,?,?,?,?,?,?)`,
  );
  for (const w of SEED_WORKFLOWS) {
    insertWorkflow.run(
      w.id, w.name, w.description, w.category, JSON.stringify(w.steps),
      w.usageCount, w.isFeatured ? 1 : 0, "Promptly Editorial", daysAgoIso(120),
    );
  }

  // Back to normal mode: triggers keep runtime writes searchable.
  db.exec(FTS_TRIGGERS_SQL);

  // Planner statistics so the query optimizer picks our indexes at scale.
  db.exec("ANALYZE");

  // eslint-disable-next-line no-console
  console.log(
    `[db] Seeded ${ALL_SEED_PROMPTS.length} curated + ${target.toLocaleString()} generated prompts, ${SEED_WORKFLOWS.length} workflows, ` +
      `${SEED_CATEGORIES.length} categories`,
  );
}
