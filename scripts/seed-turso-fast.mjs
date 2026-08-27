#!/usr/bin/env node
/**
 * Fast seed: uses @libsql/client batch API for bulk inserts.
 * Schema must already exist (run seed-turso-full.mjs once first).
 *
 * Usage: npx tsx scripts/seed-turso-fast.mjs [--count 220000]
 */
import fs from "node:fs";
import path from "node:path";

// ── Load env ────────────────────────────────────────────────────────────────
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const key = t.slice(0, i).trim();
    const val = t.slice(i + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const DB_URL = process.env.TURSO_DATABASE_URL;
const DB_TOKEN = process.env.TURSO_AUTH_TOKEN;
if (!DB_URL || !DB_TOKEN) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
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

const PROMPT_COLS = [
  "id", "title", "description", "category", "subcategory", "tasks", "tags",
  "difficulty", "prompt_text", "variables", "input_type", "output_type",
  "purpose", "transformation", "tone", "best_for", "platforms",
  "platform_adaptations", "quality_score", "usage_count", "rating",
  "rating_count", "author", "status", "source", "is_featured", "created_at",
  "updated_at", "search_text",
];

const INSERT_SQL = `INSERT OR IGNORE INTO prompts (${PROMPT_COLS.join(",")}) VALUES (${PROMPT_COLS.map(() => "?").join(",")})`;
const INSERT_FTS_SQL = `INSERT OR IGNORE INTO prompts_fts (id, text) VALUES (?, ?)`;

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

function recordToArgs(p) {
  const searchText = buildSearchText(p);
  return {
    prompt: [
      p.id, p.title, p.description, p.category, p.subcategory,
      JSON.stringify(p.tasks), JSON.stringify(p.tags), p.difficulty,
      p.promptText, JSON.stringify(p.variables), p.inputType, p.outputType,
      p.purpose, p.transformation, p.tone, JSON.stringify(p.bestFor),
      JSON.stringify(p.platforms), JSON.stringify(p.platformAdaptations),
      p.qualityScore, p.usageCount, p.rating, p.ratingCount, p.author,
      p.status, p.source, p.isFeatured ? 1 : 0, p.createdAt, p.updatedAt,
      searchText,
    ],
    fts: [p.id, searchText],
  };
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const { createClient } = await import("@libsql/client");

  function getArg(name) {
    const idx = process.argv.indexOf(name);
    return idx >= 0 && idx + 1 < process.argv.length ? process.argv[idx + 1] : undefined;
  }
  const cliStart = Number(getArg("--start")) || 0;
  const cliCount = Number(getArg("--count"));
  const genTarget = cliCount || (Number(process.env.PROMPTLY_GEN_TARGET) || 220000);
  const startIdx = cliStart;
  const endIdx = startIdx + genTarget;

  console.log(`Connecting to: ${DB_URL}`);
  console.log(`Generating ${genTarget.toLocaleString()} prompts (index ${startIdx.toLocaleString()} → ${endIdx.toLocaleString()})\n`);

  const client = createClient({ url: DB_URL, authToken: DB_TOKEN });

  // Check current state
  const countRow = await client.execute("SELECT COUNT(*) as n FROM prompts");
  const existing = Number(countRow.rows[0]?.n ?? 0);
  console.log(`Existing prompts: ${existing.toLocaleString()}\n`);

  // Import seed modules
  console.log("Loading seed modules...");
  const { CODING_PROMPTS } = await import("../src/lib/seed/prompts/coding.ts");
  const { WRITING_RESEARCH_EDUCATION_PROMPTS } = await import("../src/lib/seed/prompts/writing-research-education.ts");
  const { BUSINESS_MARKETING_FINANCE_LEGAL_PROMPTS } = await import("../src/lib/seed/prompts/business-marketing-finance-legal.ts");
  const { PRODUCTIVITY_DATA_CAREER_PROMPTS } = await import("../src/lib/seed/prompts/productivity-data-career.ts");
  const { MEDIA_MISC_PROMPTS } = await import("../src/lib/seed/prompts/media-misc.ts");
  const { COVERAGE_PEOPLE_MEDIA_PROMPTS } = await import("../src/lib/seed/prompts/coverage-people-media.ts");
  const { COVERAGE_WORK_PROMPTS } = await import("../src/lib/seed/prompts/coverage-work-data.ts");
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
  console.log(`Curated prompts: ${ALL_CURATED.length}\n`);

  // Skip re-seeding curated if --start > 0 (already seeded)
  if (startIdx === 0) {
    console.log("Seeding curated prompts...");
    const BATCH_SIZE = 500;
    for (let i = 0; i < ALL_CURATED.length; i += BATCH_SIZE) {
      const batch = ALL_CURATED.slice(i, i + BATCH_SIZE);
      const stmts = [];
      for (const seed of batch) {
        const p = seedToRecord(seed, deepenCuratedBody);
        const { prompt, fts } = recordToArgs(p);
        stmts.push({ sql: INSERT_SQL, args: prompt });
        stmts.push({ sql: INSERT_FTS_SQL, args: fts });
      }
      await client.batch(stmts);
    }
    console.log(`  Done: ${ALL_CURATED.length} curated prompts\n`);
  }

  // Seed procedural corpus using parallel batches for speed
  if (genTarget > 0) {
    console.log(`Generating ${genTarget.toLocaleString()} procedural prompts...`);
    const t0 = Date.now();
    const BIG_BATCH = 2000;
    const CONCURRENCY = 6;
    let inserted = 0;
    let retries = 0;
    const MAX_RETRIES = 3;

    // Build all batch ranges
    const ranges = [];
    for (let i = startIdx; i < endIdx; i += BIG_BATCH) {
      ranges.push([i, Math.min(i + BIG_BATCH, endIdx)]);
    }

    // Process ranges in parallel chunks with retry
    for (let chunk = 0; chunk < ranges.length; chunk += CONCURRENCY) {
      const chunkRanges = ranges.slice(chunk, chunk + CONCURRENCY);
      let ok = false;
      for (let attempt = 0; attempt < MAX_RETRIES && !ok; attempt++) {
        try {
          const promises = chunkRanges.map(([lo, hi]) => {
            const stmts = [];
            for (let j = lo; j < hi; j++) {
              const p = seedToRecord(generateSeedPrompt(j), deepenCuratedBody);
              const { prompt, fts } = recordToArgs(p);
              stmts.push({ sql: INSERT_SQL, args: prompt });
              stmts.push({ sql: INSERT_FTS_SQL, args: fts });
            }
            return client.batch(stmts).then(() => hi - lo);
          });
          const results = await Promise.all(promises);
          inserted += results.reduce((a, b) => a + b, 0);
          ok = true;
          retries = 0;
        } catch (err) {
          retries++;
          const delay = Math.min(2000 * retries, 10000);
          console.log(`  ⚠ Batch error (attempt ${attempt + 1}/${MAX_RETRIES}): ${err.message}. Retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
        }
      }
      if (!ok) {
        console.log(`  ✗ Skipping chunk at index ${ranges[chunk][0].toLocaleString()} after ${MAX_RETRIES} retries`);
        inserted += chunkRanges.reduce((a, [lo, hi]) => a + (hi - lo), 0);
      }

      if (inserted % 10000 < BIG_BATCH * CONCURRENCY || inserted >= genTarget) {
        const elapsed = (Date.now() - t0) / 1000;
        const rate = Math.round(inserted / elapsed);
        const eta = Math.round((genTarget - inserted) / rate);
        console.log(`  ${inserted.toLocaleString()} / ${genTarget.toLocaleString()} (${elapsed.toFixed(1)}s, ~${rate}/s, ETA ${eta}s)`);
      }
    }

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`\n  Generated ${inserted.toLocaleString()} prompts in ${elapsed}s\n`);
  }

  // Final verify
  const finalRow = await client.execute("SELECT COUNT(*) as n FROM prompts");
  const finalCount = Number(finalRow.rows[0]?.n ?? 0);

  const ftsRow = await client.execute("SELECT COUNT(*) as n FROM prompts_fts");
  const ftsCount = Number(ftsRow.rows[0]?.n ?? 0);

  console.log("✅ Seeding complete!");
  console.log(`   Prompts: ${finalCount.toLocaleString()}`);
  console.log(`   FTS index: ${ftsCount.toLocaleString()}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
