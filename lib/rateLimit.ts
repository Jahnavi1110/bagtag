/**
 * Sliding-window rate limiter kept in process memory.
 * Good enough for a single local server; production would use a shared
 * store such as Redis / Upstash so limits survive restarts and scale out.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>();

  return {
    check(key: string, now = Date.now()): { ok: boolean; retryAfterSec: number } {
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return { ok: false, retryAfterSec: Math.ceil((recent[0] + windowMs - now) / 1000) };
      }
      recent.push(now);
      hits.set(key, recent);
      return { ok: true, retryAfterSec: 0 };
    },
    reset() {
      hits.clear();
    },
  };
}

const globalForLimiter = globalThis as unknown as { finderLimiter?: ReturnType<typeof createRateLimiter> };

/** Finder messages: 5 per 10 minutes per IP + tag. */
export const finderLimiter = (globalForLimiter.finderLimiter ??= createRateLimiter({ limit: 5, windowMs: 10 * 60_000 }));
