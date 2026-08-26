import type { Client } from "@libsql/client";
import { SCHEMA_SQL } from "./schema";
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
  return 220_000;
}

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function seedPromptToRecord(s: SeedPrompt): PromptRecord {
  const created = daysAgoIso(s.ageDays);
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

/** Insert one prompt via the libSQL client. */
async function insertPrompt(client: Client, p: PromptRecord, searchText: string): Promise<void> {
  await client.execute({
    sql: `INSERT INTO prompts (${PROMPT_COLS.join(",")}) VALUES (${PROMPT_COLS.map(() => "?").join(",")})`,
    args: [
      p.id, p.title, p.description, p.category, p.subcategory,
      JSON.stringify(p.tasks), JSON.stringify(p.tags), p.difficulty,
      p.promptText, JSON.stringify(p.variables), p.inputType, p.outputType,
      p.purpose, p.transformation, p.tone, JSON.stringify(p.bestFor),
      JSON.stringify(p.platforms), JSON.stringify(p.platformAdaptations),
      p.qualityScore, p.usageCount, p.rating, p.ratingCount, p.author,
      p.status, p.source, p.isFeatured ? 1 : 0, p.createdAt, p.updatedAt,
      searchText,
    ],
  });
}

/** Insert one prompt into FTS index. */
async function insertFts(client: Client, id: string, text: string): Promise<void> {
  await client.execute({
    sql: "INSERT INTO prompts_fts (id, text) VALUES (?, ?)",
    args: [id, text],
  });
}

/**
 * Seed the database via Turso/libSQL client.
 * Uses batched inserts for performance — each batch is ~500 prompts.
 */
export async function seedDatabase(client: Client): Promise<void> {
  // Ensure schema exists
  const stmts = SCHEMA_SQL.split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => ({ sql: s + ";" }));
  await client.batch(stmts);

  // Seed categories
  const catStmts = SEED_CATEGORIES.flatMap((c, i) => [
    {
      sql: "INSERT OR IGNORE INTO categories (id, name, icon, color, sort) VALUES (?,?,?,?,?)",
      args: [c.id, c.name, c.icon, c.color, i] as (string | number | null)[],
    },
    ...c.subcategories.map((name) => ({
      sql: "INSERT OR IGNORE INTO subcategories (id, category_id, name) VALUES (?,?,?)",
      args: [name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), c.id, name] as (string | number | null)[],
    })),
  ]);
  await client.batch(catStmts);

  // Seed platforms
  const platStmts = SEED_PLATFORMS.map((p, i) => ({
    sql: "INSERT OR IGNORE INTO platforms (id, name, color, note, sort) VALUES (?,?,?,?,?)",      args: [p.id, p.name, p.color, p.note, i] as (string | number | null)[],
  }));
  await client.batch(platStmts);

  // Seed commands
  const cmdStmts = SEED_COMMANDS.map((c) => ({
    sql: "INSERT OR IGNORE INTO commands (cmd, label, description, intent_patch) VALUES (?,?,?,?)",      args: [c.cmd, c.label, c.description, JSON.stringify(c.intentPatch)] as (string | number | null)[],
  }));
  await client.batch(cmdStmts);

  // Seed curated prompts (batched)
  const BATCH_SIZE = 200;
  for (let i = 0; i < ALL_SEED_PROMPTS.length; i += BATCH_SIZE) {
    const batch = ALL_SEED_PROMPTS.slice(i, i + BATCH_SIZE);
    const stmts: { sql: string; args: (string | number | null)[] }[] = [];
    for (const seed of batch) {
      const p = seedPromptToRecord(seed);
      p.promptText = deepenCuratedBody(seed);
      const searchText = buildSearchText(p);
      stmts.push({
        sql: `INSERT OR IGNORE INTO prompts (${PROMPT_COLS.join(",")}) VALUES (${PROMPT_COLS.map(() => "?").join(",")})`,
        args: [
          p.id, p.title, p.description, p.category, p.subcategory ?? null,
          JSON.stringify(p.tasks), JSON.stringify(p.tags), p.difficulty,
          p.promptText, JSON.stringify(p.variables), p.inputType, p.outputType,
          p.purpose ?? null, p.transformation ?? null, p.tone ?? null, JSON.stringify(p.bestFor),
          JSON.stringify(p.platforms), JSON.stringify(p.platformAdaptations),
          p.qualityScore, p.usageCount, p.rating, p.ratingCount, p.author,
          p.status, p.source, p.isFeatured ? 1 : 0, p.createdAt, p.updatedAt,
          searchText,
        ],
      });
      stmts.push({
        sql: "INSERT OR IGNORE INTO prompts_fts (id, text) VALUES (?, ?)",
        args: [p.id, searchText],
      });
    }
    await client.batch(stmts);
  }

  // Seed generated corpus
  const target = genTarget();
  if (target > 0) {
    const t0 = Date.now();
    let inserted = 0;
    for (let i = 0; i < target; i += BATCH_SIZE) {
      const stmts: { sql: string; args: (string | number | null)[] }[] = [];
      const end = Math.min(i + BATCH_SIZE, target);
      for (let j = i; j < end; j++) {
        const p = seedPromptToRecord(generateSeedPrompt(j));
        const searchText = buildSearchText(p);
        stmts.push({
          sql: `INSERT OR IGNORE INTO prompts (${PROMPT_COLS.join(",")}) VALUES (${PROMPT_COLS.map(() => "?").join(",")})`,
          args: [
            p.id, p.title, p.description, p.category, p.subcategory ?? null,
            JSON.stringify(p.tasks), JSON.stringify(p.tags), p.difficulty,
            p.promptText, JSON.stringify(p.variables), p.inputType, p.outputType,
            p.purpose ?? null, p.transformation ?? null, p.tone ?? null, JSON.stringify(p.bestFor),
            JSON.stringify(p.platforms), JSON.stringify(p.platformAdaptations),
            p.qualityScore, p.usageCount, p.rating, p.ratingCount, p.author,
            p.status, p.source, p.isFeatured ? 1 : 0, p.createdAt, p.updatedAt,
            searchText,
          ],
        });
        stmts.push({
          sql: "INSERT OR IGNORE INTO prompts_fts (id, text) VALUES (?, ?)",
          args: [p.id, searchText],
        });
        inserted++;
      }
      await client.batch(stmts);
    }
    console.log(`[db] Generated ${inserted.toLocaleString()} procedural prompts in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }

  // Seed workflows
  const wfStmts = SEED_WORKFLOWS.map((w) => ({
    sql: `INSERT OR IGNORE INTO workflows (id, name, description, category, steps, usage_count, is_featured, author, created_at)
          VALUES (?,?,?,?,?,?,?,?,?)`,
    args: [
      w.id, w.name, w.description, w.category, JSON.stringify(w.steps),
      w.usageCount, w.isFeatured ? 1 : 0, "Promptly Editorial", daysAgoIso(120),
    ] as (string | number)[],
  }));
  await client.batch(wfStmts);

  // Create FTS triggers (if not exists)
  await client.execute({
    sql: `CREATE TRIGGER IF NOT EXISTS prompts_fts_insert AFTER INSERT ON prompts BEGIN
            INSERT INTO prompts_fts (id, text) VALUES (new.id, new.search_text);
          END`,
    args: [],
  });
  await client.execute({
    sql: `CREATE TRIGGER IF NOT EXISTS prompts_fts_delete AFTER DELETE ON prompts BEGIN
            DELETE FROM prompts_fts WHERE id = old.id;
          END`,
    args: [],
  });
  await client.execute({
    sql: `CREATE TRIGGER IF NOT EXISTS prompts_fts_update AFTER UPDATE OF search_text ON prompts BEGIN
            UPDATE prompts_fts SET text = new.search_text WHERE id = new.id;
          END`,
    args: [],
  });

  console.log(
    `[db] Seeded ${ALL_SEED_PROMPTS.length} curated + ${target.toLocaleString()} generated prompts, ${SEED_WORKFLOWS.length} workflows, ${SEED_CATEGORIES.length} categories`,
  );
}
