import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

export const ENV_FILE = path.join(process.cwd(), ".env.local");

export function readEnvFile(): Record<string, string> {
  if (!fs.existsSync(ENV_FILE)) return {};
  const out: Record<string, string> = {};
  for (const line of fs.readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

export function setEnvVar(key: string, value: string) {
  const lines = fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, "utf8").split(/\r?\n/).filter((l) => l !== "") : [];
  const idx = lines.findIndex((l) => l.startsWith(`${key}=`));
  if (idx >= 0) lines[idx] = `${key}=${value}`;
  else lines.push(`${key}=${value}`);
  fs.writeFileSync(ENV_FILE, lines.join("\n") + "\n");
}

/** Creates .env.local with a random SESSION_SECRET on first run. Never prints secrets. */
export function ensureEnv() {
  const env = readEnvFile();
  if (!env.SESSION_SECRET) setEnvVar("SESSION_SECRET", randomBytes(32).toString("hex"));
  if (!env.NEXT_PUBLIC_SITE_URL) setEnvVar("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
  const merged = readEnvFile();
  for (const [k, v] of Object.entries(merged)) process.env[k] ??= v;
  return merged;
}
