/** npm run screenshot:github: captures the public GitHub repository page at 1440×900. */
import path from "node:path";
import { chromium } from "@playwright/test";

const REPO = "https://github.com/Jahnavi1110/bagtag";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const res = await page.goto(REPO, { waitUntil: "networkidle" });
  if (!res?.ok()) throw new Error(`Could not open ${REPO} (HTTP ${res?.status()})`);
  if (await page.getByText("Quick setup").count()) throw new Error("The repository is still empty: push main first.");
  // The file list loads commit messages lazily; wait until they replace the grey placeholders.
  await page.waitForFunction(() => document.body.innerText.includes("feat("), null, { timeout: 30_000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(process.cwd(), "docs", "screenshots", "github-repo.png") });
  await browser.close();
  console.log("Saved docs/screenshots/github-repo.png");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
