import "server-only";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { getDb, now } from "@/lib/db";
import { toMessage, toTag, type MessageRow, type TagRow } from "@/lib/db/mappers";
import { generateCode } from "@/lib/codes";
import { canTransition } from "@/lib/status";
import { deleteUpload } from "@/lib/uploads";
import type { Conversation, TagDesign, TagStatus, TagSummary } from "@/lib/types";
import { getCurrentUser } from "./session";

/**
 * ACCESS CONTROL (replaces database Row Level Security).
 *
 * Every query an owner can trigger lives in ownerScope(), and every one of
 * them is bound to the signed-in user's id: tags are filtered with
 * `owner_id = ?`, and conversations/messages are reached only through a
 * join on a tag the owner owns. Route code never writes raw SQL against
 * these tables, so there is no code path where one owner can read or
 * change another owner's data, even by guessing ids.
 */
export async function requireOwner() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return ownerScope(user.id);
}

export type TagInput = { itemName: string; note: string | null; design: TagDesign; photoPath?: string | null };

export function ownerScope(ownerId: string) {
  const db = getDb();

  /** Throws unless the conversation belongs to a tag owned by ownerId. */
  const ownedConversation = (conversationId: string) =>
    db
      .prepare(
        `select c.id, c.tag_id from conversations c
         join tags t on t.id = c.tag_id
         where c.id = ? and t.owner_id = ?`,
      )
      .get(conversationId, ownerId) as { id: string; tag_id: string } | undefined;

  return {
    ownerId,

    listTags(): TagSummary[] {
      const rows = db
        .prepare(
          `select t.*,
             (select count(*) from conversations c where c.tag_id = t.id) as conversation_count,
             (select count(*) from messages m join conversations c on c.id = m.conversation_id
               where c.tag_id = t.id and m.sender = 'finder'
                 and m.created_at > coalesce(c.owner_last_read_at, '')) as unread_count
           from tags t where t.owner_id = ? order by t.created_at desc`,
        )
        .all(ownerId) as (TagRow & { conversation_count: number; unread_count: number })[];
      return rows.map((r) => ({ ...toTag(r), conversationCount: r.conversation_count, unreadCount: r.unread_count }));
    },

    getTag(tagId: string) {
      const row = db.prepare("select * from tags where id = ? and owner_id = ?").get(tagId, ownerId) as TagRow | undefined;
      return row ? toTag(row) : null;
    },

    getTags(tagIds: string[]) {
      return tagIds.map((id) => this.getTag(id)).filter((t) => t !== null);
    },

    createTag(input: TagInput) {
      const id = randomUUID();
      // Retry on the (astronomically unlikely) chance of a code collision.
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          db.prepare(
            `insert into tags (id, owner_id, code, item_name, photo_path, note, design, created_at)
             values (?, ?, ?, ?, ?, ?, ?, ?)`,
          ).run(id, ownerId, generateCode(), input.itemName, input.photoPath ?? null, input.note, JSON.stringify(input.design), now());
          return id;
        } catch (e) {
          if (!String(e).includes("UNIQUE constraint failed: tags.code")) throw e;
        }
      }
      throw new Error("Could not generate a unique code");
    },

    updateTag(tagId: string, input: TagInput) {
      const existing = this.getTag(tagId);
      if (!existing) return false;
      const photoPath = input.photoPath === undefined ? existing.photoPath : input.photoPath;
      db.prepare("update tags set item_name = ?, note = ?, design = ?, photo_path = ? where id = ? and owner_id = ?").run(
        input.itemName,
        input.note,
        JSON.stringify(input.design),
        photoPath,
        tagId,
        ownerId,
      );
      if (existing.photoPath && existing.photoPath !== photoPath) deleteUpload(existing.photoPath);
      return true;
    },

    setStatus(tagId: string, to: TagStatus) {
      const tag = this.getTag(tagId);
      if (!tag || !canTransition(tag.status, to)) return false;
      db.prepare("update tags set status = ? where id = ? and owner_id = ?").run(to, tagId, ownerId);
      return true;
    },

    deleteTag(tagId: string) {
      const tag = this.getTag(tagId);
      if (!tag) return false;
      db.prepare("delete from tags where id = ? and owner_id = ?").run(tagId, ownerId); // cascades to conversations + messages
      if (tag.photoPath) deleteUpload(tag.photoPath);
      return true;
    },

    listConversations(tagId: string): Conversation[] {
      const convs = db
        .prepare(
          `select c.id, c.created_at, c.owner_last_read_at from conversations c
           join tags t on t.id = c.tag_id
           where c.tag_id = ? and t.owner_id = ? order by c.created_at desc`,
        )
        .all(tagId, ownerId) as { id: string; created_at: string; owner_last_read_at: string | null }[];
      const msgStmt = db.prepare("select * from messages where conversation_id = ? order by created_at");
      return convs.map((c) => {
        const messages = (msgStmt.all(c.id) as MessageRow[]).map(toMessage);
        const unread = messages.filter((m) => m.sender === "finder" && m.createdAt > (c.owner_last_read_at ?? "")).length;
        return { id: c.id, createdAt: c.created_at, messages, unread };
      });
    },

    /** Loads a tag with its conversations for the manage page, then marks them read. */
    openTag(tagId: string) {
      const tag = this.getTag(tagId);
      if (!tag) return null;
      const conversations = this.listConversations(tagId);
      this.markConversationsRead(tagId);
      return { tag, conversations };
    },

    markConversationsRead(tagId: string) {
      db.prepare(
        `update conversations set owner_last_read_at = ?
         where tag_id = (select id from tags where id = ? and owner_id = ?)`,
      ).run(now(), tagId, ownerId);
    },

    reply(conversationId: string, body: string) {
      const conv = ownedConversation(conversationId);
      if (!conv) return null;
      db.prepare("insert into messages (id, conversation_id, sender, body, created_at) values (?, ?, 'owner', ?, ?)").run(
        randomUUID(),
        conv.id,
        body,
        now(),
      );
      return conv.tag_id;
    },
  };
}

export type OwnerScope = ReturnType<typeof ownerScope>;
