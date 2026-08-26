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

/** Check if the database has been seeded; if not, run the seed. */
export async function ensureSeeded(): Promise<void> {
  const client = getClient();
  const row = await client.execute("SELECT COUNT(*) AS n FROM prompts");
  const count = Number(row.rows[0]?.n ?? 0);
  if (count === 0) {
    await seedDatabase(client);
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
