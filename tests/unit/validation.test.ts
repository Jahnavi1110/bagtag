import { describe, expect, it } from "vitest";
import { credentialsSchema, finderMessageSchema, tagSchema } from "@/lib/validation";
import { DEFAULT_DESIGN } from "@/lib/templates";

const msg = (over: Record<string, unknown> = {}) => finderMessageSchema.safeParse({ code: "abcd2345", body: "Found it", website: "", ...over });

describe("finder message schema", () => {
  it("accepts a normal message and upper-cases the code", () => {
    const r = msg();
    expect(r.success && r.data.code).toBe("ABCD2345");
  });

  it("enforces 1–1000 characters", () => {
    expect(msg({ body: "" }).success).toBe(false);
    expect(msg({ body: "   " }).success).toBe(false);
    expect(msg({ body: "a".repeat(1000) }).success).toBe(true);
    expect(msg({ body: "a".repeat(1001) }).success).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    expect(msg({ website: "http://spam.example" }).success).toBe(false);
  });

  it("requires both coordinates and valid ranges", () => {
    expect(msg({ lat: 12.9, lng: 77.6 }).success).toBe(true);
    expect(msg({ lat: 12.9 }).success).toBe(false);
    expect(msg({ lat: 95, lng: 0 }).success).toBe(false);
  });
});

describe("tag schema", () => {
  const tag = (over: Record<string, unknown> = {}) => tagSchema.safeParse({ itemName: "Suitcase", note: "", design: DEFAULT_DESIGN, ...over });

  it("turns an empty note into null", () => {
    const r = tag();
    expect(r.success && r.data.note).toBeNull();
  });

  it("limits the note to 200 characters", () => {
    expect(tag({ note: "n".repeat(200) }).success).toBe(true);
    expect(tag({ note: "n".repeat(201) }).success).toBe(false);
  });

  it("limits item name to 1–60 characters", () => {
    expect(tag({ itemName: "" }).success).toBe(false);
    expect(tag({ itemName: "x".repeat(61) }).success).toBe(false);
  });

  it("rejects unknown templates and bad colours", () => {
    expect(tag({ design: { ...DEFAULT_DESIGN, template: "poster" } }).success).toBe(false);
    expect(tag({ design: { ...DEFAULT_DESIGN, color: "red" } }).success).toBe(false);
  });
});

describe("credentials schema", () => {
  it("requires a valid email and an 8+ character password", () => {
    expect(credentialsSchema.safeParse({ email: "a@b.co", password: "12345678" }).success).toBe(true);
    expect(credentialsSchema.safeParse({ email: "nope", password: "12345678" }).success).toBe(false);
    expect(credentialsSchema.safeParse({ email: "a@b.co", password: "short" }).success).toBe(false);
  });
});
