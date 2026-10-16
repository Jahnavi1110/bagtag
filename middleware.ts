import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/jwt";

/** Redirects signed-out visitors away from owner pages. Server code re-checks ownership on every query. */
export async function middleware(req: NextRequest) {
  const userId = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (userId) return NextResponse.next();
  const url = new URL("/login", req.url);
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

// Node.js runtime: jose and the session secret are read the same way as in server code.
export const config = { runtime: "nodejs", matcher: ["/dashboard/:path*", "/tags/:path*"] };
