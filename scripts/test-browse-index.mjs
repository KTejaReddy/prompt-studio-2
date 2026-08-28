import { createClient } from "@libsql/client";

const c = createClient({ url: "file:data/promptly.sqlite" });

async function test() {
  await c.execute("PRAGMA journal_mode=WAL");

  // Check if browse_index exists
  const idxExists = await c.execute(
    "SELECT 1 FROM sqlite_master WHERE type='table' AND name='browse_index'"
  );
  console.log("browse_index exists:", idxExists.rows.length > 0);

  if (idxExists.rows.length === 0) {
    console.log("browse_index not found — run seed first");
    return;
  }

  // Count rows in browse_index
  const idxCount = await c.execute("SELECT COUNT(*) as n FROM browse_index WHERE sort_key='popular'");
  console.log("browse_index rows:", Number(idxCount.rows[0].n));

  // SLOW: Raw ORDER BY (the old way)
  console.time("SLOW-ORDER-BY");
  const slow = await c.execute(
    "SELECT id, title, category FROM prompts WHERE status='published' ORDER BY usage_count DESC LIMIT 48 OFFSET 0"
  );
  console.timeEnd("SLOW-ORDER-BY");
  console.log("  Got", slow.rows.length, "rows");

  // FAST: Via browse_index
  console.time("FAST-BROWSE-INDEX");
  const fast = await c.execute(
    "SELECT prompt_id FROM browse_index WHERE sort_key='popular' ORDER BY position LIMIT 48 OFFSET 0"
  );
  console.timeEnd("FAST-BROWSE-INDEX");
  console.log("  Got", fast.rows.length, "IDs");

  // FAST: Via browse_index + hydration
  console.time("FAST-HYDRATE");
  const ids = fast.rows.map(r => r.prompt_id);
  const placeholders = ids.map(() => "?").join(",");
  const hydrated = await c.execute({
    sql: `SELECT id, title, category FROM prompts WHERE id IN (${placeholders}) AND status='published'`,
    args: ids,
  });
  console.timeEnd("FAST-HYDRATE");
  console.log("  Got", hydrated.rows.length, "rows");

  // FAST: Via browse_index with category filter
  console.time("FAST-CATEGORY");
  const catFast = await c.execute({
    sql: "SELECT prompt_id FROM browse_index WHERE sort_key='popular' AND category='coding' ORDER BY position LIMIT 48 OFFSET 0",
    args: [],
  });
  console.timeEnd("FAST-CATEGORY");
  console.log("  Got", catFast.rows.length, "coding prompts");

  // SLOW: Raw ORDER BY with category filter
  console.time("SLOW-CATEGORY");
  const catSlow = await c.execute({
    sql: "SELECT id FROM prompts WHERE status='published' AND category='coding' ORDER BY usage_count DESC LIMIT 48",
    args: [],
  });
  console.timeEnd("SLOW-CATEGORY");
  console.log("  Got", catSlow.rows.length, "coding prompts");

  // Check browse_totals
  const totals = await c.execute("SELECT filter_key, total FROM browse_totals ORDER BY total DESC");
  console.log("\nbrowse_totals:");
  for (const r of totals.rows) {
    console.log(`  ${r.filter_key}: ${Number(r.total).toLocaleString()}`);
  }
}

test().catch(console.error);
