import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { closeDb, getDb } from "@/lib/db";

/** Points the app at a fresh temporary SQLite file for one test file. */
export function useTempDb() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tagback-test-"));
  process.env.DB_PATH = path.join(dir, "test.db");
  closeDb();
  const db = getDb();
  return {
    db,
    file: process.env.DB_PATH,
    cleanup() {
      closeDb();
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}

export function insertUser(id: string, email: string) {
  getDb().prepare("insert into users (id, email, password_hash, created_at) values (?, ?, 'x', ?)").run(id, email, new Date().toISOString());
}
