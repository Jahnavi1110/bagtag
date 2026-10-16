import { describe, expect, it } from "vitest";
import { canTransition } from "@/lib/status";

describe("status transitions", () => {
  it("allows the normal lost → found → safe cycle", () => {
    expect(canTransition("safe", "lost")).toBe(true);
    expect(canTransition("lost", "found")).toBe(true);
    expect(canTransition("found", "safe")).toBe(true);
  });

  it("allows cancelling a lost report and re-reporting a found item", () => {
    expect(canTransition("lost", "safe")).toBe(true);
    expect(canTransition("found", "lost")).toBe(true);
  });

  it("rejects no-op and skipped transitions", () => {
    expect(canTransition("safe", "safe")).toBe(false);
    expect(canTransition("safe", "found")).toBe(false);
  });
});
