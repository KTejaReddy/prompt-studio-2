import { createClient } from "@libsql/client";

const c = createClient({ url: "file:data/promptly.sqlite" });
const BATCH_SIZE = 200;

async function build() {
  await c.execute("PRAGMA journal_mode=WAL");
  await c.execute("PRAGMA synchronous=NORMAL");
  await c.execute("PRAGMA cache_size=-64000");

  // Create tables if not exist
  await c.execute(`
    CREATE TABLE IF NOT EXISTS browse_index (
      sort_key TEXT NOT NULL,
      position INTEGER NOT NULL,
      prompt_id TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      difficulty TEXT NOT NULL DEFAULT '',
      PRIMARY KEY (sort_key, position)
    )
  `);
  await c.execute(`CREATE INDEX IF NOT EXISTS idx_browse_cat ON browse_index(sort_key, category, position)`);
  await c.execute(`
    CREATE TABLE IF NOT EXISTS browse_totals (
      filter_key TEXT PRIMARY KEY,
      total INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    )
  `);

  const SORT_COLS = {
    popular: "usage_count DESC",
    rating: "rating DESC",
    recent: "created_at DESC",
    quality: "quality_score DESC",
  };

  const t1 = Date.now();
  for (const [sortKey, orderBy] of Object.entries(SORT_COLS)) {
    console.log(`Building browse_index for ${sortKey}...`);
    await c.execute({ sql: "DELETE FROM browse_index WHERE sort_key = ?", args: [sortKey] });

    const posRows = await c.execute({
      sql: `SELECT id, category, difficulty FROM prompts WHERE status='published' ORDER BY ${orderBy}`,
      args: [],
    });

    const stmts = [];
    for (let i = 0; i < posRows.rows.length; i++) {
      const row = posRows.rows[i];
      stmts.push({
        sql: "INSERT INTO browse_index (sort_key, position, prompt_id, category, difficulty) VALUES (?,?,?,?,?)",
        args: [sortKey, i, String(row.id), String(row.category), String(row.difficulty)],
      });
      if (stmts.length >= BATCH_SIZE) {
        await c.batch(stmts.splice(0));
      }
    }
    if (stmts.length) await c.batch(stmts);
    console.log(`  ${posRows.rows.length.toLocaleString()} rows indexed`);
  }
  console.log(`browse_index built in ${((Date.now() - t1) / 1000).toFixed(1)}s`);

  // Build browse_totals
  console.log("Building browse_totals...");
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
  console.log(`browse_totals: ${grandTotal.toLocaleString()} total, ${totalRows.rows.length} categories`);
  console.log("Done!");
}

build().catch(console.error);
