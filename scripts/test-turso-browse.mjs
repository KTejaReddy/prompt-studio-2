import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const url = env.match(/TURSO_DATABASE_URL=(.*)/)?.[1]?.trim();
const token = env.match(/TURSO_AUTH_TOKEN=(.*)/)?.[1]?.trim();

const c = createClient({ url, authToken: token });

async function test() {
  // Check if browse_index exists on Turso
  const idxExists = await c.execute(
    "SELECT 1 FROM sqlite_master WHERE type='table' AND name='browse_index'"
  );
  console.log("browse_index exists on Turso:", idxExists.rows.length > 0);

  if (idxExists.rows.length === 0) {
    console.log("browse_index NOT on Turso — need to seed Turso with the new schema");
    // Still test the slow way
    console.time("SLOW-BROWSE-POPULAR");
    const r = await c.execute({
      sql: "SELECT id, title FROM prompts WHERE status='published' ORDER BY usage_count DESC LIMIT 48",
      args: [],
    });
    console.timeEnd("SLOW-BROWSE-POPULAR");
    console.log("Got", r.rows.length, "rows");
    return;
  }

  // Test 1: browse via index (no filters)
  console.time("TURSO-INDEX-POPULAR");
  const r1 = await c.execute({
    sql: "SELECT prompt_id FROM browse_index WHERE sort_key='popular' ORDER BY position LIMIT 48 OFFSET 0",
    args: [],
  });
  console.timeEnd("TURSO-INDEX-POPULAR");
  console.log("  Got", r1.rows.length, "IDs");

  // Hydrate
  const ids = r1.rows.map(r => r.prompt_id);
  const placeholders = ids.map(() => "?").join(",");
  console.time("TURSO-HYDRATE");
  const r2 = await c.execute({
    sql: `SELECT id, title, category, usage_count FROM prompts WHERE id IN (${placeholders}) AND status='published'`,
    args: ids,
  });
  console.timeEnd("TURSO-HYDRATE");
  console.log("  Got", r2.rows.length, "rows");

  // Test 2: browse via index with category filter
  console.time("TURSO-INDEX-CAT");
  const r3 = await c.execute({
    sql: "SELECT prompt_id FROM browse_index WHERE sort_key='popular' AND category='coding' ORDER BY position LIMIT 48 OFFSET 0",
    args: [],
  });
  console.timeEnd("TURSO-INDEX-CAT");
  console.log("  Got", r3.rows.length, "coding IDs");

  // Test 3: countBrowse from cache
  console.time("TURSO-COUNT-ALL");
  const r4 = await c.execute("SELECT total FROM browse_totals WHERE filter_key='all'");
  console.timeEnd("TURSO-COUNT-ALL");
  console.log("  Total:", Number(r4.rows[0]?.total ?? 0).toLocaleString());

  // Test 4: countBrowse category
  console.time("TURSO-COUNT-CAT");
  const r5 = await c.execute({ sql: "SELECT total FROM browse_totals WHERE filter_key=?", args: ["cat:coding"] });
  console.timeEnd("TURSO-COUNT-CAT");
  console.log("  Coding:", Number(r5.rows[0]?.total ?? 0).toLocaleString());

  // Test 5: pagination — page 10
  console.time("TURSO-INDEX-PAGE10");
  const r6 = await c.execute({
    sql: "SELECT prompt_id FROM browse_index WHERE sort_key='popular' ORDER BY position LIMIT 48 OFFSET 480",
    args: [],
  });
  console.timeEnd("TURSO-INDEX-PAGE10");
  console.log("  Page 10:", r6.rows.length, "IDs");
}

test().catch(console.error);
