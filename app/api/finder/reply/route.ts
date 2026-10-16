import { NextResponse } from "next/server";
import { addFinderMessage } from "@/lib/finder";
import { clientIp, jsonError, readJson } from "@/lib/http";
import { finderLimiter } from "@/lib/rateLimit";
import { hashToken } from "@/lib/tokens";
import { finderReplySchema, firstError } from "@/lib/validation";

/** POST /api/finder/reply: a follow-up message from the finder's private chat link. */
export async function POST(req: Request) {
  const parsed = finderReplySchema.safeParse(await readJson(req));
  if (!parsed.success) return jsonError(firstError(parsed.error), 400);

  const limit = finderLimiter.check(`${clientIp(req)}:${hashToken(parsed.data.token)}`);
  if (!limit.ok) {
    return jsonError("Too many messages. Please try again later.", 429, { "Retry-After": String(limit.retryAfterSec) });
  }

  if (!addFinderMessage(parsed.data.token, parsed.data.body)) return jsonError("Conversation not found", 404);
  return NextResponse.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
