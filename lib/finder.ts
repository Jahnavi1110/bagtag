import "server-only";
import { randomUUID } from "node:crypto";
import { getDb, now } from "@/lib/db";
import { toMessage, type MessageRow } from "@/lib/db/mappers";
import { createFinderToken, hashToken } from "@/lib/tokens";
import type { Message, PublicTag } from "@/lib/types";

/**
 * PRIVACY: everything a finder (anonymous visitor) can do goes through
 * these functions. They select only public columns: never owner_id, the
 * owner's email, or any other contact data. Finders are identified only by
 * the hash of their private chat token; no name, email or IP is stored.
 */

export function getPublicTag(code: string): PublicTag | null {
  const row = getDb()
    .prepare("select code, item_name, photo_path, note, status from tags where code = ?")
    .get(code) as { code: string; item_name: string; photo_path: string | null; note: string | null; status: PublicTag["status"] } | undefined;
  return row ? { code: row.code, itemName: row.item_name, photoPath: row.photo_path, note: row.note, status: row.status } : null;
}

/** Equivalent of an `increment_scan(code)` SQL function: called each time the public page is viewed. */
export function incrementScan(code: string) {
  getDb().prepare("update tags set scan_count = scan_count + 1 where code = ?").run(code);
}

/** Public page load: returns the public fields and counts the scan. */
export function viewPublicTag(rawCode: string): PublicTag | null {
  const tag = getPublicTag(rawCode.toUpperCase());
  if (tag) incrementScan(tag.code);
  return tag;
}

/**
 * Starts a conversation for the finder's first message. Generates a random
 * token, stores ONLY its SHA-256 hash, and returns the raw token once so the
 * finder can be given their private link /chat/<token>.
 */
export function startConversation(input: { code: string; body: string; lat?: number | null; lng?: number | null }): string | null {
  const db = getDb();
  const tag = db.prepare("select id from tags where code = ?").get(input.code) as { id: string } | undefined;
  if (!tag) return null;

  const { token, hash } = createFinderToken();
  const conversationId = randomUUID();
  const at = now();
  db.transaction(() => {
    db.prepare("insert into conversations (id, tag_id, finder_token_hash, created_at) values (?, ?, ?, ?)").run(conversationId, tag.id, hash, at);
    db.prepare("insert into messages (id, conversation_id, sender, body, lat, lng, created_at) values (?, ?, 'finder', ?, ?, ?, ?)").run(
      randomUUID(),
      conversationId,
      input.body,
      input.lat ?? null,
      input.lng ?? null,
      at,
    );
  })();
  return token;
}

/** Looks up a conversation by the finder's raw token (hashed before the query). */
export function getFinderConversation(token: string): { conversationId: string; tag: PublicTag; messages: Message[] } | null {
  const db = getDb();
  const conv = db
    .prepare(
      `select c.id, t.code from conversations c join tags t on t.id = c.tag_id
       where c.finder_token_hash = ?`,
    )
    .get(hashToken(token)) as { id: string; code: string } | undefined;
  if (!conv) return null;
  const messages = (db.prepare("select * from messages where conversation_id = ? order by created_at").all(conv.id) as MessageRow[]).map(toMessage);
  return { conversationId: conv.id, tag: getPublicTag(conv.code)!, messages };
}

export function addFinderMessage(token: string, body: string): boolean {
  const conv = getFinderConversation(token);
  if (!conv) return false;
  getDb()
    .prepare("insert into messages (id, conversation_id, sender, body, created_at) values (?, ?, 'finder', ?, ?)")
    .run(randomUUID(), conv.conversationId, body, now());
  return true;
}
