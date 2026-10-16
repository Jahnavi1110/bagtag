import { execSync } from "node:child_process";

/** Seeds the local database (demo@tagback.test) before the smoke test. */
export default function globalSetup() {
  execSync("npx tsx scripts/seed.ts", { stdio: "inherit" });
}
