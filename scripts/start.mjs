/**
 * Production start wrapper: spawns the Next server binary directly, waits for
 * the HTTP listener, then warms the hot paths (home aggregates + one FTS
 * search) so the first human request never pays the multi-second cold-cache
 * cost of the 2.1 GB corpus. Retries until the warm actually lands.
 */
import { spawn } from "node:child_process";

const PORT = process.env.PORT ?? 4318;
const BASE = `http://127.0.0.1:${PORT}`;

const child = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)],
  { stdio: ["ignore", "pipe", "inherit"] },
);

// The desktop environment can remap the requested port — read the port Next
// actually bound from its own startup banner instead of assuming.
let base = BASE;
const portReady = new Promise((resolve) => {
  child.stdout.on("data", (chunk) => {
    const text = chunk.toString();
    process.stdout.write(text);
    const m = text.match(/Local:\s+http:\/\/localhost:(\d+)/);
    if (m) resolve(Number(m[1]));
  });
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ok(url) {
  try {
    const res = await fetch(url);
    return res.ok;
  } catch {
    return false;
  }
}

async function waitForServer(base) {
  for (let i = 0; i < 240; i++) {
    if (await ok(`${base}/api/taxonomy`)) return true;
    await sleep(500);
  }
  return false;
}

async function warm() {
  const actualPort = await Promise.race([
    portReady,
    sleep(15000).then(() => PORT),
  ]);
  const urlBase = `http://127.0.0.1:${actualPort}`;
  if (!(await waitForServer(urlBase))) {
    // eslint-disable-next-line no-console
    console.log("[warmup] server never became reachable; skipping");
    return;
  }
  const t0 = Date.now();
  for (let attempt = 1; attempt <= 10; attempt++) {
    const [home, search] = await Promise.all([
      fetch(`${urlBase}/?warmup=1`).then((r) => r.ok).catch(() => false),
      fetch(
        `${urlBase}/api/search?q=launch&sort=quality&limit=36`,
      ).then((r) => r.ok).catch(() => false),
    ]);
    if (home && search) {
      // eslint-disable-next-line no-console
      console.log(
        `[warmup] caches primed in ${((Date.now() - t0) / 1000).toFixed(1)}s`,
      );
      return;
    }
    await sleep(1000);
  }
  // eslint-disable-next-line no-console
  console.log("[warmup] could not complete; app still serves normally");
}

warm().catch(() => {});
child.on("exit", (code) => process.exit(code ?? 0));
