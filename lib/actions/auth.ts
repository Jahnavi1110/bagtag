"use server";

import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getDb, now } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth/session";
import { credentialsSchema, firstError } from "@/lib/validation";

export type FormState = { error?: string; ok?: boolean } | undefined;

// Compared against when the email is unknown, so response time does not reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("tagback-dummy-password", 10);

/** Only allow same-site relative redirects (prevents open redirects via ?next=). */
const safeNext = (next: FormDataEntryValue | null) =>
  typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

export async function signup(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = credentialsSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const db = getDb();
  if (db.prepare("select 1 from users where email = ?").get(parsed.data.email)) return { error: "An account with this email already exists" };

  const id = randomUUID();
  const hash = await bcrypt.hash(parsed.data.password, 12);
  db.prepare("insert into users (id, email, password_hash, created_at) values (?, ?, ?, ?)").run(id, parsed.data.email, hash, now());
  await createSession(id);
  redirect("/dashboard");
}

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = credentialsSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Invalid email or password" };

  const user = getDb().prepare("select id, password_hash from users where email = ?").get(parsed.data.email) as
    | { id: string; password_hash: string }
    | undefined;
  const valid = await bcrypt.compare(parsed.data.password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !valid) return { error: "Invalid email or password" };

  await createSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  await destroySession();
  redirect("/");
}
