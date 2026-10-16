import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ownerScope } from "@/lib/auth/requireOwner";
import { getPublicTag, startConversation } from "@/lib/finder";
import { DEFAULT_DESIGN } from "@/lib/templates";
import { insertUser, useTempDb } from "./testDb";

describe("owner access control", () => {
  let ctx: ReturnType<typeof useTempDb>;
  beforeAll(() => {
    ctx = useTempDb();
    insertUser("alice", "alice@test.local");
    insertUser("bob", "bob@test.local");
  });
  afterAll(() => ctx.cleanup());

  it("never lets one owner read or change another owner's tag or conversations", () => {
    const alice = ownerScope("alice");
    const bob = ownerScope("bob");
    const tagId = alice.createTag({ itemName: "Alice's bag", note: null, design: DEFAULT_DESIGN });
    const code = alice.getTag(tagId)!.code;
    startConversation({ code, body: "Found it" });
    const convId = alice.listConversations(tagId)[0].id;

    expect(bob.getTag(tagId)).toBeNull();
    expect(bob.listTags()).toEqual([]);
    expect(bob.listConversations(tagId)).toEqual([]);
    expect(bob.setStatus(tagId, "lost")).toBe(false);
    expect(bob.reply(convId, "hijack")).toBeNull();
    expect(bob.deleteTag(tagId)).toBe(false);

    expect(alice.getTag(tagId)?.status).toBe("safe");
    expect(alice.listConversations(tagId)[0].messages).toHaveLength(1);
  });

  it("exposes only public fields to finders", () => {
    const alice = ownerScope("alice");
    const tag = alice.getTag(alice.createTag({ itemName: "Keys", note: "Reward", design: DEFAULT_DESIGN }))!;
    expect(Object.keys(getPublicTag(tag.code)!).sort()).toEqual(["code", "itemName", "note", "photoPath", "status"]);
  });

  it("counts unread finder messages until the owner opens the tag", () => {
    const alice = ownerScope("alice");
    const tagId = alice.createTag({ itemName: "Umbrella", note: null, design: DEFAULT_DESIGN });
    startConversation({ code: alice.getTag(tagId)!.code, body: "Hello" });
    expect(alice.listTags().find((t) => t.id === tagId)?.unreadCount).toBe(1);
    alice.openTag(tagId);
    expect(alice.listTags().find((t) => t.id === tagId)?.unreadCount).toBe(0);
  });
});
