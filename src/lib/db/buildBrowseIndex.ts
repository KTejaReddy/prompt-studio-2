import type { Client } from "@libsql/client";

const BATCH_SIZE = 200;

const SORT_COLS: Record<string, string> = {
  popular: "usage_count DESC",
  rating: "rating DESC",
  recent: "created_at DESC",
  quality: "quality_score DESC",
};

/**
 * Build the browse_index and browse_totals tables on any database.
 * These pre-computed tables make browse queries fast (sub-second on Turso)
 * by avoiding expensive ORDER BY scans on 220k+ rows.
 *
 * Call once after seeding, or whenever prompts change significantly.
 */
export async function buildBrowseIndex(client: Client): Promise<void> {
  const t0 = Date.now();
  console.log("[db] Building browse_index...");

  // Create tables if not exist
  await client.execute({
    sql: `CREATE TABLE IF NOT EXISTS browse_index (
      sort_key TEXT NOT NULL,
      position INTEGER NOT NULL,
      prompt_id TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      difficulty TEXT NOT NULL DEFAULT '',
      PRIMARY KEY (sort_key, position)
    )`,
    args: [],
  });
  await client.execute({
    sql: "CREATE INDEX IF NOT EXISTS idx_browse_cat ON browse_index(sort_key, category, position)",
    args: [],
  });
  await client.execute({
    sql: `CREATE TABLE IF NOT EXISTS browse_totals (
      filter_key TEXT PRIMARY KEY,
      total INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    )`,
    args: [],
  });

  // Build sorted position maps for each sort order
  for (const [sortKey, orderBy] of Object.entries(SORT_COLS)) {
    await client.execute({
      sql: "DELETE FROM browse_index WHERE sort_key = ?",
      args: [sortKey],
    });

    const posRows = await client.execute({
      sql: `SELECT id, category, difficulty FROM prompts WHERE status='published' ORDER BY ${orderBy}`,
      args: [],
    });

    const stmts: { sql: string; args: (string | number | null)[] }[] = [];
    for (let i = 0; i < posRows.rows.length; i++) {
      const row = posRows.rows[i];
      stmts.push({
        sql: "INSERT INTO browse_index (sort_key, position, prompt_id, category, difficulty) VALUES (?,?,?,?,?)",
        args: [sortKey, i, String(row.id), String(row.category), String(row.difficulty)],
      });
      if (stmts.length >= BATCH_SIZE) {
        await client.batch(stmts.splice(0));
      }
    }
    if (stmts.length) await client.batch(stmts);
    console.log(`[db] ${sortKey}: ${posRows.rows.length.toLocaleString()} rows indexed`);
  }

  // Build cached totals
  await client.execute({ sql: "DELETE FROM browse_totals", args: [] });
  const totalRows = await client.execute({
    sql: "SELECT category, COUNT(*) as n FROM prompts WHERE status='published' GROUP BY category",
    args: [],
  });
  const now = new Date().toISOString();
  const totalStmts: { sql: string; args: (string | number | null)[] }[] = [];
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
  await client.batch(totalStmts);
  console.log(`[db] browse_totals: ${grandTotal.toLocaleString()} total, ${totalRows.rows.length} categories`);
  console.log(`[db] browse_index built in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
