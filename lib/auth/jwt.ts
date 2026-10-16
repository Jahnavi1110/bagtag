import { SignJWT, jwtVerify } from "jose";

/** Edge-safe session helpers (used by middleware and server code). */
export const SESSION_COOKIE = "tb_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET is missing; run `npm run dev` once to generate it.");
  return new TextEncoder().encode(secret);
}

export function signSession(userId: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

/** Returns the user id, or null if the cookie is missing, tampered with or expired. */
export async function verifySession(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
