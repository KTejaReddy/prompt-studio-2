import { createClient, type Client } from "@libsql/client";
import { SCHEMA_SQL } from "./schema";
import { seedDatabase } from "./seed";

/**
 * Database layer using Turso (libSQL cloud).
 *
 * When TURSO_DATABASE_URL is set, queries go to Turso's cloud — no local
 * SQLite needed.  This works in serverless (Vercel, Netlify, etc.) because
 * there's no file I/O involved.
 *
 * Falls back to a local file via `file:` URL for development.
 */

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

declare global {
  // eslint-disable-next-line no-var
  var __promptlyClient: Client | undefined;
  // eslint-disable-next-line no-var
  var __promptlySeeded: boolean | undefined;
}

function createDbClient(): Client {
  if (TURSO_URL) {
    return createClient({
      url: TURSO_URL,
      authToken: TURSO_TOKEN,
    });
  }
  // Local development: file-based libSQL (no Turso account needed).
  return createClient({ url: "file:data/promptly.sqlite" });
}

function getClient(): Client {
  if (!globalThis.__promptlyClient) {
    globalThis.__promptlyClient = createDbClient();
  }
  return globalThis.__promptlyClient;
}

/** Apply performance pragmas on first connection. */
let pragmasApplied = false;
async function applyPragmas(client: Client): Promise<void> {
  if (pragmasApplied) return;
  try {
    await client.execute('PRAGMA synchronous=NORMAL');
    await client.execute('PRAGMA journal_mode=WAL');
    await client.execute('PRAGMA cache_size=-64000'); // 64MB page cache
    pragmasApplied = true;
  } catch {
    // Pragmas are best-effort; remote Turso may not support all of them.
  }
}

/**
 * Check if the database has been seeded; if not, run the seed.
 * Caches the result per serverless instance so subsequent requests skip the COUNT query.
 */
export async function ensureSeeded(): Promise<void> {
  if (globalThis.__promptlySeeded) return;
  const client = getClient();
  await applyPragmas(client);
  // On Turso (remote), skip the check — DB is already seeded. Only check locally.
  if (TURSO_URL) {
    globalThis.__promptlySeeded = true;
  } else {
    const table = await client.execute(
      "SELECT 1 FROM sqlite_master WHERE type='table' AND name='prompts' LIMIT 1",
    );
    if (table.rows.length === 0) {
      await seedDatabase(client);
    }
    globalThis.__promptlySeeded = true;
  }
}

/**
 * Async query helper — returns an array of row objects.
 * Mirrors the old sync `query()` signature for easy migration.
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  ...params: (string | number | null)[]
): Promise<T[]> {
  const client = getClient();
  const result = await client.execute({ sql, args: params });
  return result.rows as unknown as T[];
}

/**
 * Async single-row helper — returns one row or undefined.
 */
export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  ...params: (string | number | null)[]
): Promise<T | undefined> {
  const rows = await query<T>(sql, ...params);
  return rows[0];
}

/**
 * Async write helper — runs INSERT/UPDATE/DELETE.
 */
export async function run(
  sql: string,
  ...params: (string | number | null)[]
): Promise<void> {
  const client = getClient();
  await client.execute({ sql, args: params });
}

/**
 * Execute multiple statements as a batch (atomic).
 */
export async function executeBatch(
  stmts: { sql: string; args?: (string | number | null)[] }[],
): Promise<void> {
  const client = getClient();
  const batch = stmts.map((s) => ({
    sql: s.sql,
    args: s.args ?? [],
  }));
  await client.batch(batch);
}
