import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { SCHEMA_SQL } from "./schema";
import { seedDatabase } from "./seed";

/**
 * SQLite connection layer built on the Node built-in `node:sqlite` driver.
 * The rest of the app depends only on this small interface, so swapping to
 * Postgres or another engine later means reimplementing this file only.
 */

const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "promptly-data")
  : path.join(process.cwd(), "data");
const DB_PATH = process.env.PROMPTLY_DB ?? path.join(DATA_DIR, "promptly.sqlite");

/** Vercel serverless has limited RAM and a read-only root fs (only /tmp is writable). */
const IS_VERCEL = !!process.env.VERCEL;

declare global {
  // eslint-disable-next-line no-var
  var __promptlyDb: DatabaseSync | undefined;
}

function openDatabase(): DatabaseSync {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  if (IS_VERCEL) {
    // Vercel serverless: lean pragmas, no mmap, small cache.
    db.exec("PRAGMA cache_size = -8192;"); // 8 MiB page cache
    db.exec("PRAGMA synchronous = NORMAL;");
    db.exec("PRAGMA temp_store = MEMORY;");
  } else {
    // Local / self-hosted: aggressive caching for the multi-GB corpus.
    db.exec("PRAGMA cache_size = -65536;"); // 64 MiB page cache
    db.exec("PRAGMA mmap_size = 805306368;"); // memory-map 768 MiB of the file
    db.exec("PRAGMA synchronous = NORMAL;");
    db.exec("PRAGMA temp_store = MEMORY;");
    db.exec("PRAGMA optimize");
  }
  return db;
}

function getDb(): DatabaseSync {
  if (!globalThis.__promptlyDb) {
    const db = openDatabase();
    migrateLegacySchema(db);
    db.exec(SCHEMA_SQL);
    const row = db.prepare("SELECT COUNT(*) AS n FROM prompts").get() as
      | { n: number }
      | undefined;
    if (!row || row.n === 0) {
      seedDatabase(db);
    }
    globalThis.__promptlyDb = db;
  }
  return globalThis.__promptlyDb;
}

/**
 * On Vercel serverless the /tmp DB is ephemeral — seeded fresh on each cold
 * start. Expose a quick health check so the home page can verify the DB.
 */
export function isDbReady(): boolean {
  try {
    const r = getDb().prepare("SELECT 1").get();
    return !!r;
  } catch {
    return false;
  }
}

/**
 * Pre-FTS databases lack the prompts.search_text column the schema now needs.
 * Dev data is disposable (npm run db:reset), so drop and reseed rather than
 * attempting a 100k+ row backfill at boot.
 */
function migrateLegacySchema(db: DatabaseSync): void {
  const hasPrompts = db
    .prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='prompts'")
    .get();
  if (!hasPrompts) return;
  const cols = db.prepare("PRAGMA table_info(prompts)").all() as unknown as {
    name: string;
  }[];
  if (cols.some((c) => c.name === "search_text")) return;
  db.exec(
    `DROP TRIGGER IF EXISTS prompts_fts_insert; DROP TRIGGER IF EXISTS prompts_fts_delete;
     DROP TRIGGER IF EXISTS prompts_fts_update; DROP TABLE IF EXISTS prompts_fts;
     DROP TABLE IF EXISTS prompts; DROP TABLE IF EXISTS workflows;
     DROP TABLE IF EXISTS commands; DROP TABLE IF EXISTS saved_prompts;
     DROP TABLE IF EXISTS submissions; DROP TABLE IF EXISTS events;
     DROP TABLE IF EXISTS subcategories; DROP TABLE IF EXISTS categories;
     DROP TABLE IF EXISTS platforms;`,
  );
}

/** Prepared-statement helpers used by repositories. */
export function query<T extends object>(
  sql: string,
  ...params: (string | number | null)[]
): T[] {
  return getDb().prepare(sql).all(...params) as unknown as T[];
}

export function queryOne<T extends object>(
  sql: string,
  ...params: (string | number | null)[]
): T | undefined {
  return getDb().prepare(sql).get(...params) as unknown as T | undefined;
}

export function run(
  sql: string,
  ...params: (string | number | null)[]
): void {
  getDb().prepare(sql).run(...params);
}
