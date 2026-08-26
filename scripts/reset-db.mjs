/**
 * Reset the local Promptly database.
 * Removes the SQLite file plus WAL/SHM sidecars; schema + seed data are
 * recreated automatically on the next server request.
 */
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
const custom = process.env.PROMPTLY_DB;

const targets = custom
  ? [custom, `${custom}-wal`, `${custom}-shm`]
  : ["promptly.sqlite", "promptly.sqlite-wal", "promptly.sqlite-shm"].map((f) =>
      path.join(dataDir, f),
    );

let removed = 0;
for (const file of targets) {
  if (fs.existsSync(file)) {
    fs.rmSync(file);
    console.log(`removed ${file}`);
    removed++;
  }
}

if (removed === 0) {
  console.log("no database files found — nothing to reset");
} else {
  console.log("done. The database will re-seed on next start.");
}
