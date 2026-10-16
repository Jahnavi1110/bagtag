import "server-only";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "./jwt";

export async function createSession(userId: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, await signSession(userId), {
    httpOnly: true, // not readable from JavaScript
    sameSite: "lax", // not sent on cross-site POSTs
    secure: (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://"),
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** The signed-in user, or null. Also checks the user still exists. */
export async function getCurrentUser(): Promise<{ id: string; email: string } | null> {
  const userId = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  const row = getDb().prepare("select id, email from users where id = ?").get(userId) as { id: string; email: string } | undefined;
  return row ?? null;
}
