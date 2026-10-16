import fs from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createFinderToken, hashToken } from "@/lib/tokens";
import { getFinderConversation, startConversation } from "@/lib/finder";
import { ownerScope } from "@/lib/auth/requireOwner";
import { DEFAULT_DESIGN } from "@/lib/templates";
import { insertUser, useTempDb } from "./testDb";

describe("finder tokens", () => {
  it("are 32 chars and hash to 64 hex chars", () => {
    const { token, hash } = createFinderToken();
    expect(token).toHaveLength(32);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).toBe(hashToken(token));
    expect(hash).not.toContain(token);
  });

  it("are unique", () => {
    const tokens = new Set(Array.from({ length: 1000 }, () => createFinderToken().token));
    expect(tokens.size).toBe(1000);
  });
});

describe("raw token is never stored", () => {
  let ctx: ReturnType<typeof useTempDb>;
  let code = "";
  beforeAll(() => {
    ctx = useTempDb();
    insertUser("u1", "owner@test.local");
    const owner = ownerScope("u1");
    code = owner.getTag(owner.createTag({ itemName: "Bag", note: null, design: DEFAULT_DESIGN }))!.code;
  });
  afterAll(() => ctx.cleanup());

  it("stores only the hash and can look the conversation up by the raw token", () => {
    const token = startConversation({ code, body: "Found your bag" })!;
    expect(token).toHaveLength(32);

    const rows = ctx.db.prepare("select finder_token_hash from conversations").all() as { finder_token_hash: string }[];
    expect(rows).toEqual([{ finder_token_hash: hashToken(token) }]);

    ctx.db.pragma("wal_checkpoint(TRUNCATE)");
    expect(fs.readFileSync(ctx.file).toString("latin1")).not.toContain(token);

    expect(getFinderConversation(token)?.messages[0].body).toBe("Found your bag");
    expect(getFinderConversation(hashToken(token))).toBeNull(); // the hash itself is not a valid link
  });
});
