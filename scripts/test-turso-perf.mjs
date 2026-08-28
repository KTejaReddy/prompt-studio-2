import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

// Load env
const env = readFileSync(".env.local", "utf8");
const url = env.match(/TURSO_DATABASE_URL=(.*)/)?.[1]?.trim();
const token = env.match(/TURSO_AUTH_TOKEN=(.*)/)?.[1]?.trim();

console.log("Turso URL:", url);

const c = createClient({ url, authToken: token });

async function test() {
  console.time("COUNT");
  const r1 = await c.execute("SELECT COUNT(*) as n FROM prompts WHERE status = 'published'");
  console.timeEnd("COUNT");
  console.log("Total published:", Number(r1.rows[0].n));

  console.time("BROWSE-page1");
  const r2 = await c.execute({
    sql: "SELECT id, title, category, usage_count FROM prompts WHERE status = 'published' ORDER BY usage_count DESC LIMIT 48",
    args: [],
  });
  console.timeEnd("BROWSE-page1");
  console.log("Page 1:", r2.rows.length, "rows");

  console.time("BROWSE-page2");
  const r3 = await c.execute({
    sql: "SELECT id, title, category, usage_count FROM prompts WHERE status = 'published' ORDER BY usage_count DESC LIMIT 48 OFFSET 48",
    args: [],
  });
  console.timeEnd("BROWSE-page2");
  console.log("Page 2:", r3.rows.length, "rows");

  console.time("CATEGORIES");
  const r4 = await c.execute("SELECT category, COUNT(*) as n FROM prompts WHERE status='published' GROUP BY category ORDER BY n DESC");
  console.timeEnd("CATEGORIES");
  console.log("Categories:", r4.rows.length);
  for (const row of r4.rows) {
    console.log(`  ${row.category}: ${Number(row.n).toLocaleString()}`);
  }

  // Test FTS
  console.time("FTS-check");
  const r5 = await c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='prompts_fts'");
  console.timeEnd("FTS-check");
  console.log("FTS table exists:", r5.rows.length > 0);

  // Test browse with different sort orders
  console.time("BROWSE-rating");
  const r6 = await c.execute({
    sql: "SELECT id, title, rating FROM prompts WHERE status = 'published' ORDER BY rating DESC LIMIT 48",
    args: [],
  });
  console.timeEnd("BROWSE-rating");
  console.log("Rating sort:", r6.rows.length, "rows");
}

test().catch(console.error);
