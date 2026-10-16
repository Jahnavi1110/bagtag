import { createHash } from "node:crypto";
import { nanoid } from "nanoid";

/**
 * PRIVACY: the finder's private chat link is /chat/<token>.
 * The raw token is returned to the finder exactly once and never stored;
 * the database keeps only its SHA-256 hash, so a leaked database cannot
 * be used to open a finder's conversation or impersonate them.
 */
export function createFinderToken() {
  const token = nanoid(32); // 32 URL-safe chars ≈ 190 bits of randomness
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
