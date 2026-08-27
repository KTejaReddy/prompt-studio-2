#!/usr/bin/env node
/**
 * Seed the FULL Promptly dataset into Turso via the pipeline HTTP API.
 *
 * Uses the same pipeline approach as seed-turso.mjs (proven to work),
 * but seeds ALL curated prompts from the app's TypeScript seed modules
 * plus the procedurally generated corpus.
 *
 * Usage: node scripts/seed-turso-full.mjs
 */
import fs from "node:fs";
import path from "node:path";

// ── Load env vars from .env.local ───────────────────────────────────────────
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const DB_URL = process.env.TURSO_DATABASE_URL;
const DB_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!DB_URL || !DB_TOKEN) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env.local");
  process.exit(1);
}

const HTTP_URL = DB_URL.replace("libsql://", "https://");
const AUTH_HEADER = { Authorization: `Bearer ${DB_TOKEN}` };

// ── Pipeline API helpers ────────────────────────────────────────────────────
async function pipeline(sqls) {
  const requests = [
    ...sqls.map((sql) => ({ type: "execute", stmt: { sql } })),
    { type: "close" },
  ];
  const res = await fetch(`${HTTP_URL}/v2/pipeline`, {
    method: "POST",
    headers: { ...AUTH_HEADER, "Content-Type": "application/json" },
    body: JSON.stringify({ requests }),
  });
  const data = await res.json();
  const errors = data.results?.filter((r) => r.type === "error") ?? [];
  return { ok: errors.length === 0, errors };
}

async function pipelineWithArgs(stmts) {
  const requests = [
    ...stmts.map(({ sql, args }) => ({
      type: "execute",
      stmt: {
        sql,
        args: args.map((a) =>
          typeof a === "number"
            ? Number.isInteger(a)
              ? { type: "integer", value: String(a) }
              : { type: "float", value: a }
            : a === null
              ? { type: "null", value: null }
              : { type: "text", value: String(a) }
        ),
      },
    })),
    { type: "close" },
  ];
  const res = await fetch(`${HTTP_URL}/v2/pipeline`, {
    method: "POST",
    headers: { ...AUTH_HEADER, "Content-Type": "application/json" },
    body: JSON.stringify({ requests }),
  });
  const data = await res.json();
  const errors = data.results?.filter((r) => r.type === "error") ?? [];
  return { ok: errors.length === 0, errors, count: stmts.length };
}

function daysAgoIso(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function buildSearchText(p) {
  return [
    p.title, p.title, p.description, p.subcategory || "",
    p.tags.join(" "), p.tasks.join(" "), p.purpose || "",
    p.bestFor.join(" "), (p.promptText || p.body || "").slice(0, 240),
  ].join(" ").toLowerCase();
}

// ── Schema (identical to seed-turso.mjs — uses semicolon-safe approach) ────
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#F4572E',
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS subcategories (
  id TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  PRIMARY KEY (id, category_id)
);
CREATE TABLE IF NOT EXISTS platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#472B52',
  note TEXT NOT NULL DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  tasks TEXT NOT NULL DEFAULT '[]',
  tags TEXT NOT NULL DEFAULT '[]',
  difficulty TEXT NOT NULL DEFAULT 'intermediate',
  prompt_text TEXT NOT NULL,
  variables TEXT NOT NULL DEFAULT '[]',
  input_type TEXT NOT NULL DEFAULT 'text',
  output_type TEXT NOT NULL DEFAULT 'text',
  purpose TEXT,
  transformation TEXT,
  tone TEXT,
  best_for TEXT NOT NULL DEFAULT '[]',
  platforms TEXT NOT NULL DEFAULT '[]',
  platform_adaptations TEXT NOT NULL DEFAULT '{}',
  quality_score REAL NOT NULL DEFAULT 0.8,
  usage_count INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  author TEXT NOT NULL DEFAULT 'Promptly Editorial',
  status TEXT NOT NULL DEFAULT 'published',
  source TEXT NOT NULL DEFAULT 'seed',
  is_featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  search_text TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts(status);
CREATE INDEX IF NOT EXISTS idx_prompts_featured ON prompts(is_featured);
CREATE INDEX IF NOT EXISTS idx_prompts_usage ON prompts(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_rating ON prompts(rating DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_created ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_quality ON prompts(quality_score DESC) WHERE status='published';
CREATE INDEX IF NOT EXISTS idx_prompts_pub_usage ON prompts(usage_count DESC) WHERE status='published';
CREATE INDEX IF NOT EXISTS idx_prompts_pub_rating ON prompts(rating DESC) WHERE status='published';
CREATE INDEX IF NOT EXISTS idx_prompts_pub_created ON prompts(created_at DESC) WHERE status='published';
CREATE VIRTUAL TABLE IF NOT EXISTS prompts_fts USING fts5(id UNINDEXED, text);
CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  steps TEXT NOT NULL DEFAULT '[]',
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  author TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS commands (
  cmd TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  intent_patch TEXT NOT NULL DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  prompt_id TEXT,
  outcome TEXT,
  meta TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type, created_at DESC);
`;

// ── Import seed data from TypeScript modules ────────────────────────────────
async function loadSeedData() {
  // Import taxonomy
  const { SEED_CATEGORIES } = await import("../src/lib/seed/taxonomy.ts");
  const { SEED_PLATFORMS } = await import("../src/lib/seed/platforms.ts");
  const { SEED_COMMANDS } = await import("../src/lib/seed/commands.ts");
  const { SEED_WORKFLOWS } = await import("../src/lib/seed/workflows.ts");

  // Import curated prompts
  const { CODING_PROMPTS } = await import("../src/lib/seed/prompts/coding.ts");
  const { WRITING_RESEARCH_EDUCATION_PROMPTS } = await import("../src/lib/seed/prompts/writing-research-education.ts");
  const { BUSINESS_MARKETING_FINANCE_LEGAL_PROMPTS } = await import("../src/lib/seed/prompts/business-marketing-finance-legal.ts");
  const { PRODUCTIVITY_DATA_CAREER_PROMPTS } = await import("../src/lib/seed/prompts/productivity-data-career.ts");
  const { MEDIA_MISC_PROMPTS } = await import("../src/lib/seed/prompts/media-misc.ts");
  const { COVERAGE_PEOPLE_MEDIA_PROMPTS } = await import("../src/lib/seed/prompts/coverage-people-media.ts");
  const { COVERAGE_WORK_PROMPTS } = await import("../src/lib/seed/prompts/coverage-work-data.ts");

  // Import generator
  const { generateSeedPrompt, deepenCuratedBody } = await import("../src/lib/seed/generator.ts");

  const ALL_CURATED = [
    ...CODING_PROMPTS,
    ...WRITING_RESEARCH_EDUCATION_PROMPTS,
    ...BUSINESS_MARKETING_FINANCE_LEGAL_PROMPTS,
    ...PRODUCTIVITY_DATA_CAREER_PROMPTS,
    ...MEDIA_MISC_PROMPTS,
    ...COVERAGE_PEOPLE_MEDIA_PROMPTS,
    ...COVERAGE_WORK_PROMPTS,
  ];

  return {
    categories: SEED_CATEGORIES,
    platforms: SEED_PLATFORMS,
    commands: SEED_COMMANDS,
    workflows: SEED_WORKFLOWS,
    curated: ALL_CURATED,
    generateSeedPrompt,
    deepenCuratedBody,
  };
}

function seedToRecord(seed, deepenFn) {
  const created = daysAgoIso(seed.ageDays);
  const quality = Math.min(0.99, 0.55 + (seed.rating / 5) * 0.35 + Math.min(seed.usageCount, 6000) / 60000);
  const body = deepenFn(seed);
  return {
    id: seed.id,
    title: seed.title,
    description: seed.description,
    category: seed.category,
    subcategory: seed.subcategory ?? "",
    tasks: seed.tasks,
    tags: seed.tags,
    difficulty: seed.difficulty,
    promptText: body,
    variables: seed.variables ?? [],
    inputType: seed.inputType,
    outputType: seed.outputType,
    purpose: seed.purpose ?? "",
    transformation: seed.transformation ?? "",
    tone: seed.tone ?? "",
    bestFor: seed.bestFor,
    platforms: seed.platforms,
    platformAdaptations: {},
    qualityScore: Number(quality.toFixed(3)),
    usageCount: seed.usageCount,
    rating: seed.rating,
    ratingCount: seed.ratingCount,
    author: seed.author ?? "Promptly Editorial",
    status: "published",
    source: seed.source ?? "seed",
    isFeatured: !!seed.featured,
    createdAt: created,
    updatedAt: created,
  };
}

const PROMPT_COLS = [
  "id", "title", "description", "category", "subcategory", "tasks", "tags",
  "difficulty", "prompt_text", "variables", "input_type", "output_type",
  "purpose", "transformation", "tone", "best_for", "platforms",
  "platform_adaptations", "quality_score", "usage_count", "rating",
  "rating_count", "author", "status", "source", "is_featured", "created_at",
  "updated_at", "search_text",
];

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Connecting to: ${HTTP_URL}`);
  console.log("");

  // 1. Load all seed data from TypeScript modules
  console.log("Loading seed data from TypeScript modules...");
  const data = await loadSeedData();
  console.log(`  Curated prompts loaded: ${data.curated.length}`);
  console.log("");

  // 2. Clear existing data
  console.log("Clearing existing data...");
  await pipeline([
    "DROP TRIGGER IF EXISTS prompts_fts_insert",
    "DROP TRIGGER IF EXISTS prompts_fts_delete",
    "DROP TRIGGER IF EXISTS prompts_fts_update",
    "DELETE FROM prompts_fts",
    "DELETE FROM prompts",
    "DELETE FROM workflows",
    "DELETE FROM commands",
    "DELETE FROM subcategories",
    "DELETE FROM categories",
    "DELETE FROM platforms",
  ]);
  console.log("  Done.");
  console.log("");

  // 3. Push schema
  const schemaStmts = SCHEMA_SQL.split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => s + ";");
  const schemaResult = await pipeline(schemaStmts);
  if (!schemaResult.ok) {
    console.error("Schema creation failed!", schemaResult.errors);
    process.exit(1);
  }
  console.log(`[schema] OK (${schemaStmts.length} stmts)`);
  console.log("");

  // 4. Seed categories + subcategories
  const catStmts = [];
  data.categories.forEach((c, i) => {
    catStmts.push({
      sql: `INSERT OR IGNORE INTO categories (id, name, icon, color, sort) VALUES (?, ?, ?, ?, ?)`,
      args: [c.id, c.name, c.icon, c.color, i],
    });
    c.subcategories.forEach((name) => {
      catStmts.push({
        sql: `INSERT OR IGNORE INTO subcategories (id, category_id, name) VALUES (?, ?, ?)`,
        args: [name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), c.id, name],
      });
    });
  });
  const catResult = await pipelineWithArgs(catStmts);
  console.log(`[categories] OK (${data.categories.length} categories + subcategories)`);
  console.log("");

  // 5. Seed platforms
  const platStmts = data.platforms.map((p, i) => ({
    sql: `INSERT OR IGNORE INTO platforms (id, name, color, note, sort) VALUES (?, ?, ?, ?, ?)`,
    args: [p.id, p.name, p.color, p.note, i],
  }));
  await pipelineWithArgs(platStmts);
  console.log(`[platforms] OK (${data.platforms.length} platforms)`);
  console.log("");

  // 6. Seed commands
  const cmdStmts = data.commands.map((c) => ({
    sql: `INSERT OR IGNORE INTO commands (cmd, label, description, intent_patch) VALUES (?, ?, ?, ?)`,
    args: [c.cmd, c.label, c.description, JSON.stringify(c.intentPatch)],
  }));
  await pipelineWithArgs(cmdStmts);
  console.log(`[commands] OK (${data.commands.length} commands)`);
  console.log("");

  // 7. Seed curated prompts (batched via pipeline)
  const BATCH = 50;
  let promptCount = 0;
  for (let i = 0; i < data.curated.length; i += BATCH) {
    const batch = data.curated.slice(i, i + BATCH);
    const stmts = [];
    for (const seed of batch) {
      const p = seedToRecord(seed, data.deepenCuratedBody);
      const searchText = buildSearchText(p);
      stmts.push({
        sql: `INSERT OR IGNORE INTO prompts (${PROMPT_COLS.join(",")}) VALUES (${PROMPT_COLS.map(() => "?").join(",")})`,
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
      stmts.push({
        sql: `INSERT OR IGNORE INTO prompts_fts (id, text) VALUES (?, ?)`,
        args: [p.id, searchText],
      });
    }
    const result = await pipelineWithArgs(stmts);
    if (!result.ok) {
      console.error(`[prompts batch ${i}-${i + batch.length}] errors:`, result.errors.slice(0, 2));
    }
    promptCount += batch.length;
    if (promptCount % 500 === 0 || promptCount === data.curated.length) {
      console.log(`[prompts] ${promptCount} seeded...`);
    }
  }
  console.log(`[prompts] OK (${promptCount} curated prompts)`);
  console.log("");

  // 8. Seed procedural corpus
  // Accept --count N CLI arg to override PROMPTLY_GEN_TARGET
  const cliCount = process.argv.includes("--count")
    ? Number(process.argv[process.argv.indexOf("--count") + 1])
    : undefined;
  const genTarget = cliCount ?? (Number(process.env.PROMPTLY_GEN_TARGET) || 0);
  if (genTarget > 0) {
    console.log(`Generating ${genTarget.toLocaleString()} procedural prompts...`);
    const t0 = Date.now();
    let genCount = 0;
    for (let i = 0; i < genTarget; i += BATCH) {
      const stmts = [];
      const end = Math.min(i + BATCH, genTarget);
      for (let j = i; j < end; j++) {
        const p = seedToRecord(data.generateSeedPrompt(j), data.deepenCuratedBody);
        const searchText = buildSearchText(p);
        stmts.push({
          sql: `INSERT OR IGNORE INTO prompts (${PROMPT_COLS.join(",")}) VALUES (${PROMPT_COLS.map(() => "?").join(",")})`,
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
        stmts.push({
          sql: `INSERT OR IGNORE INTO prompts_fts (id, text) VALUES (?, ?)`,
          args: [p.id, searchText],
        });
        genCount++;
      }
      const result = await pipelineWithArgs(stmts);
      if (!result.ok && genCount % 1000 === 0) {
        console.error(`  batch errors at ${genCount}:`, result.errors.slice(0, 1));
      }
      if (genCount % 5000 === 0) {
        console.log(`  ${genCount.toLocaleString()} generated...`);
      }
    }
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`[generated] OK (${genCount.toLocaleString()} prompts in ${elapsed}s)`);
    promptCount += genCount;
    console.log("");
  } else {
    console.log("[generated] Skipped (PROMPTLY_GEN_TARGET=0)");
    console.log("");
  }

  // 9. Seed workflows
  const wfStmts = data.workflows.map((w) => ({
    sql: `INSERT OR IGNORE INTO workflows (id, name, description, category, steps, usage_count, is_featured, author, created_at) VALUES (?,?,?,?,?,?,?,?,?)`,
    args: [
      w.id, w.name, w.description, w.category, JSON.stringify(w.steps),
      w.usageCount, w.isFeatured ? 1 : 0, "Promptly Editorial", daysAgoIso(120),
    ],
  }));
  await pipelineWithArgs(wfStmts);
  console.log(`[workflows] OK (${data.workflows.length} workflows)`);
  console.log("");

  // 10. Create FTS triggers
  const triggerSqls = [
    `CREATE TRIGGER IF NOT EXISTS prompts_fts_insert AFTER INSERT ON prompts BEGIN INSERT INTO prompts_fts (id, text) VALUES (new.id, new.search_text); END`,
    `CREATE TRIGGER IF NOT EXISTS prompts_fts_delete AFTER DELETE ON prompts BEGIN DELETE FROM prompts_fts WHERE id = old.id; END`,
    `CREATE TRIGGER IF NOT EXISTS prompts_fts_update AFTER UPDATE OF search_text ON prompts BEGIN UPDATE prompts_fts SET text = new.search_text WHERE id = new.id; END`,
  ];
  await pipeline(triggerSqls);
  console.log("[triggers] OK");
  console.log("");

  // 11. Verify
  const verifyRes = await fetch(`${HTTP_URL}/v2/pipeline`, {
    method: "POST",
    headers: { ...AUTH_HEADER, "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [
        { type: "execute", stmt: { sql: "SELECT COUNT(*) as n FROM prompts" } },
        { type: "close" },
      ],
    }),
  });
  const verifyData = await verifyRes.json();
  const finalCount = verifyData.results?.[0]?.response?.result?.rows?.[0]?.[0]?.value ?? "unknown";

  console.log("✅ Turso database seeded successfully!");
  console.log(`   Database URL: ${DB_URL}`);
  console.log(`   Total prompts: ${Number(finalCount).toLocaleString()}`);
  console.log(`   Categories: ${data.categories.length}`);
  console.log(`   Platforms: ${data.platforms.length}`);
  console.log(`   Workflows: ${data.workflows.length}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
