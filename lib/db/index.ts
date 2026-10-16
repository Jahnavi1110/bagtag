import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

/**
 * Local SQLite database (./data/tagback.db). The schema is created
 * automatically on first open and every statement is idempotent
 * (`if not exists`), so starting the app twice is safe.
 */
export const SCHEMA = `
create table if not exists users (
  id            text primary key,
  email         text not null unique collate nocase,
  password_hash text not null,
  created_at    text not null
);

create table if not exists tags (
  id          text primary key,
  owner_id    text not null references users(id) on delete cascade,
  code        text not null unique check (length(code) = 8),
  item_name   text not null check (length(item_name) between 1 and 60),
  photo_path  text,
  note        text check (note is null or length(note) <= 200),
  design      text not null default '{}',
  status      text not null default 'safe' check (status in ('safe','lost','found')),
  scan_count  integer not null default 0,
  created_at  text not null
);
create index if not exists tags_owner_idx on tags(owner_id, created_at);

create table if not exists conversations (
  id                 text primary key,
  tag_id             text not null references tags(id) on delete cascade,
  finder_token_hash  text not null unique,
  owner_last_read_at text,
  created_at         text not null
);
create index if not exists conversations_tag_idx on conversations(tag_id);

create table if not exists messages (
  id              text primary key,
  conversation_id text not null references conversations(id) on delete cascade,
  sender          text not null check (sender in ('finder','owner')),
  body            text not null check (length(body) between 1 and 1000),
  lat             real,
  lng             real,
  created_at      text not null
);
create index if not exists messages_conversation_idx on messages(conversation_id, created_at);
`;

export function dbPath() {
  return process.env.DB_PATH ?? path.join(process.cwd(), "data", "tagback.db");
}

const globalForDb = globalThis as unknown as { tagbackDb?: Database.Database };

export function getDb(): Database.Database {
  if (!globalForDb.tagbackDb) {
    const file = dbPath();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const db = new Database(file);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db.pragma("busy_timeout = 5000");
    db.exec(SCHEMA);
    globalForDb.tagbackDb = db;
  }
  return globalForDb.tagbackDb;
}

export function closeDb() {
  globalForDb.tagbackDb?.close();
  globalForDb.tagbackDb = undefined;
}

export const now = () => new Date().toISOString();
