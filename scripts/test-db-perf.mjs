import { createClient } from "@libsql/client";

const c = createClient({ url: "file:data/promptly.sqlite" });

async function test() {
  // Performance pragmas
  await c.execute("PRAGMA journal_mode=WAL");
  await c.execute("PRAGMA mmap_size=268435456"); // 256MB mmap
  await c.execute("PRAGMA synchronous=NORMAL");
  await c.execute("PRAGMA cache_size=-64000"); // 64MB page cache

  console.time("COUNT");
  const r1 = await c.execute("SELECT COUNT(*) as n FROM prompts WHERE status = 'published'");
  console.timeEnd("COUNT");
  console.log("Total:", Number(r1.rows[0].n));

  console.time("BROWSE-LIMIT48");
  const r2 = await c.execute(
    "SELECT id, title, category, usage_count FROM prompts WHERE status = 'published' ORDER BY usage_count DESC LIMIT 48"
  );
  console.timeEnd("BROWSE-LIMIT48");
  console.log("Got", r2.rows.length, "rows");

  console.time("BROWSE-OFFSET48");
  const r3 = await c.execute(
    "SELECT id, title, category, usage_count FROM prompts WHERE status = 'published' ORDER BY usage_count DESC LIMIT 48 OFFSET 48"
  );
  console.timeEnd("BROWSE-OFFSET48");
  console.log("Got", r3.rows.length, "rows");

  console.time("EXPLAIN");
  const plan = await c.execute("EXPLAIN QUERY PLAN SELECT id, title, category, usage_count FROM prompts WHERE status = 'published' ORDER BY usage_count DESC LIMIT 48");
  console.timeEnd("EXPLAIN");
  console.log("Query plan:", JSON.stringify(plan.rows, null, 2));

  // Check indexes
  const idxs = await c.execute("SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='prompts'");
  console.log("\nIndexes on prompts:");
  for (const row of idxs.rows) {
    console.log(`  ${row.name}: ${row.sql}`);
  }
}

test().catch(console.error);
