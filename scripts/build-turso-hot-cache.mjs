import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const url = env.match(/TURSO_DATABASE_URL=(.*)/)?.[1]?.trim();
const token = env.match(/TURSO_AUTH_TOKEN=(.*)/)?.[1]?.trim();

console.log("Connecting to Turso:", url);
const c = createClient({ url, authToken: token });

const TOP_N = 200; // top N per category per sort
const BATCH_SIZE = 100;
const SORT_COLS = {
  popular: "usage_count DESC",
  rating: "rating DESC",
  recent: "created_at DESC",
  quality: "quality_score DESC",
};

async function build() {
  const t0 = Date.now();

  // Create the hot cache table
  console.log("Creating browse_hot table...");
  await c.execute({
    sql: `CREATE TABLE IF NOT EXISTS browse_hot (
      sort_key TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      position INTEGER NOT NULL,
      prompt_id TEXT NOT NULL,
      PRIMARY KEY (sort_key, category, position)
    )`,
    args: [],
  });

  // Get all categories
  const cats = await c.execute({
    sql: "SELECT DISTINCT category FROM prompts WHERE status='published'",
    args: [],
  });
  const categories = ["" , ...cats.rows.map(r => String(r.category))];
  console.log(`Found ${categories.length} categories (including 'all')`);

  for (const [sortKey, orderBy] of Object.entries(SORT_COLS)) {
    console.log(`\nBuilding ${sortKey}...`);
    
    if (categories.includes("")) {
      // "all" category = no category filter
      await c.execute({ sql: "DELETE FROM browse_hot WHERE sort_key = ? AND category = ''", args: [sortKey] });
      const rows = await c.execute({
        sql: `SELECT id FROM prompts WHERE status='published' ORDER BY ${orderBy} LIMIT ${TOP_N}`,
        args: [],
      });
      const stmts = [];
      for (let i = 0; i < rows.rows.length; i++) {
        stmts.push({
          sql: "INSERT INTO browse_hot (sort_key, category, position, prompt_id) VALUES (?,?,?,?)",
          args: [sortKey, "", i, String(rows.rows[i].id)],
        });
      }
      if (stmts.length) await c.batch(stmts);
      console.log(`  all: ${rows.rows.length} prompts`);
    }

    // Per-category top N
    for (const cat of categories) {
      if (cat === "") continue;
      await c.execute({
        sql: "DELETE FROM browse_hot WHERE sort_key = ? AND category = ?",
        args: [sortKey, cat],
      });
      const rows = await c.execute({
        sql: `SELECT id FROM prompts WHERE status='published' AND category = ? ORDER BY ${orderBy} LIMIT ${TOP_N}`,
        args: [cat],
      });
      const stmts = [];
      for (let i = 0; i < rows.rows.length; i++) {
        stmts.push({
          sql: "INSERT INTO browse_hot (sort_key, category, position, prompt_id) VALUES (?,?,?,?)",
          args: [sortKey, cat, i, String(rows.rows[i].id)],
        });
      }
      if (stmts.length) await c.batch(stmts);
    }
    console.log(`  per-category done`);
  }

  // Build browse_totals
  console.log("\nBuilding browse_totals...");
  await c.execute({ sql: "DELETE FROM browse_totals", args: [] });
  const totalRows = await c.execute({
    sql: "SELECT category, COUNT(*) as n FROM prompts WHERE status='published' GROUP BY category",
    args: [],
  });
  const now = new Date().toISOString();
  const totalStmts = [];
  let grandTotal = 0;
  for (const row of totalRows.rows) {
    const n = Number(row.n);
    grandTotal += n;
    totalStmts.push({
      sql: "INSERT INTO browse_totals (filter_key, total, updated_at) VALUES (?,?,?)",
      args: [`cat:${String(row.category)}`, n, now],
    });
  }
  totalStmts.push({
    sql: "INSERT INTO browse_totals (filter_key, total, updated_at) VALUES (?,?,?)",
    args: ["all", grandTotal, now],
  });
  await c.batch(totalStmts);
  console.log(`Total: ${grandTotal.toLocaleString()} prompts`);

  // Verify
  const count = await c.execute("SELECT COUNT(*) as n FROM browse_hot");
  console.log(`browse_hot table: ${Number(count.rows[0].n).toLocaleString()} rows`);
  console.log(`Done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

build().catch(console.error);
