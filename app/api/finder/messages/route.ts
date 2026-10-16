import { NextResponse } from "next/server";
import { startConversation } from "@/lib/finder";
import { clientIp, jsonError, readJson } from "@/lib/http";
import { finderLimiter } from "@/lib/rateLimit";
import { finderMessageSchema, firstError } from "@/lib/validation";

/**
 * POST /api/finder/messages: a finder's FIRST message about a tag.
 * 1. Validate with zod (length limits, coordinates, honeypot must be empty).
 * 2. Rate-limit per IP + tag code (5 per 10 minutes).
 * 3. Create the conversation; respond with the private chat link. The raw
 *    token appears only in this response; the database stores its hash.
 */
export async function POST(req: Request) {
  const parsed = finderMessageSchema.safeParse(await readJson(req));
  if (!parsed.success) return jsonError(firstError(parsed.error), 400);
  const { code, body, lat, lng } = parsed.data;

  const limit = finderLimiter.check(`${clientIp(req)}:${code}`);
  if (!limit.ok) {
    return jsonError("Too many messages. Please try again later.", 429, { "Retry-After": String(limit.retryAfterSec) });
  }

  const token = startConversation({ code, body, lat, lng });
  if (!token) return jsonError("Tag not found", 404);

  return NextResponse.json({ chatPath: `/chat/${token}` }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
