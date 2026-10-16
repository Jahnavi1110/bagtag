import fs from "node:fs";
import { closeDb, dbPath, getDb } from "../lib/db";

for (const suffix of ["", "-wal", "-shm"]) fs.rmSync(dbPath() + suffix, { force: true });
getDb(); // recreates the schema
closeDb();
console.log(`Database reset at ${dbPath()}`);
