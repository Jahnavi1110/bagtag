import { NextResponse } from "next/server";

/** Best-effort client IP for rate limiting. Used only as an in-memory key; never stored or shown to the owner. */
export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
}

export const jsonError = (error: string, status: number, headers?: HeadersInit) => NextResponse.json({ error }, { status, headers });

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
