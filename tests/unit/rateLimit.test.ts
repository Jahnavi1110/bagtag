import { describe, expect, it } from "vitest";
import { createRateLimiter } from "@/lib/rateLimit";

describe("rate limiter", () => {
  it("allows 5 messages per 10 minutes, then blocks", () => {
    const rl = createRateLimiter({ limit: 5, windowMs: 600_000 });
    for (let i = 0; i < 5; i++) expect(rl.check("ip:TAG", 1000 + i).ok).toBe(true);
    const blocked = rl.check("ip:TAG", 2000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("keeps separate buckets per key", () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(rl.check("a", 0).ok).toBe(true);
    expect(rl.check("b", 0).ok).toBe(true);
    expect(rl.check("a", 1).ok).toBe(false);
  });

  it("allows again once the window has passed", () => {
    const rl = createRateLimiter({ limit: 2, windowMs: 1000 });
    rl.check("k", 0);
    rl.check("k", 10);
    expect(rl.check("k", 500).ok).toBe(false);
    expect(rl.check("k", 1001).ok).toBe(true);
  });
});
