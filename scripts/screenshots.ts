/**
 * npm run screenshots: builds and starts the app on a free port, seeds demo
 * data, captures the pages listed in the README into docs/screenshots/, then
 * shuts the server down.
 */
import { execSync, spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { chromium, type Page } from "@playwright/test";
import { ensureEnv, readEnvFile } from "./env";

const OUT = path.join(process.cwd(), "docs", "screenshots");
const DEMO_EMAIL = "demo@tagback.test";

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const { port } = srv.address() as net.AddressInfo;
      srv.close(() => resolve(port));
    });
    srv.on("error", reject);
  });
}

async function waitForServer(url: string, timeoutMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server did not start at ${url}`);
}

const shot = (page: Page, name: string) => page.screenshot({ path: path.join(OUT, name) });
const qrReady = (page: Page) => page.locator('[data-testid="tag-preview"][data-ready="true"]').first().waitFor();

async function main() {
  ensureEnv();
  execSync("npx next build", { stdio: "inherit" });
  execSync("npx tsx scripts/seed.ts", { stdio: "inherit" });

  const port = await freePort();
  const base = `http://localhost:${port}`;
  const server = spawn("npx", ["next", "start", "-p", String(port)], { shell: true, stdio: "ignore" });
  const stop = () => {
    if (process.platform === "win32") execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: "ignore" });
    else server.kill("SIGTERM");
  };

  try {
    await waitForServer(base);
    const browser = await chromium.launch();
    const desktop = { viewport: { width: 1440, height: 900 } };

    // Owner pages
    const ownerCtx = await browser.newContext({ ...desktop, acceptDownloads: true });
    const owner = await ownerCtx.newPage();
    await owner.goto(`${base}/`);
    await shot(owner, "landing.png");

    await owner.goto(`${base}/login`);
    await owner.getByLabel("Email").fill(DEMO_EMAIL);
    await owner.getByLabel("Password").fill(readEnvFile().DEMO_PASSWORD);
    await shot(owner, "login.png");
    await owner.getByRole("button", { name: "Log in" }).click();
    await owner.waitForURL("**/dashboard");
    await shot(owner, "dashboard.png");

    await owner.goto(`${base}/tags/new`);
    await owner.getByLabel("Item name").fill("Travel backpack");
    await owner.getByLabel("Note for the finder (optional, e.g. a reward)").fill("Reward offered. Thank you for helping!");
    await owner.getByRole("button", { name: /School-bag label/ }).click();
    await owner.getByRole("button", { name: "Colour #16a34a" }).click();
    await owner.getByLabel("Custom text line").fill("Scan to message me anonymously");
    await qrReady(owner);
    await shot(owner, "tag-maker.png");

    await owner.goto(`${base}/dashboard`);
    await owner.getByRole("listitem").filter({ hasText: "Blue suitcase" }).getByRole("link", { name: "Open" }).click();
    await owner.waitForURL(/\/tags\/[0-9a-f-]{36}$/);
    await qrReady(owner);
    await shot(owner, "owner-chat.png");
    const [download] = await Promise.all([owner.waitForEvent("download"), owner.getByRole("button", { name: "Download PNG" }).click()]);
    await download.saveAs(path.join(OUT, "tag-export.png"));

    await owner.goto(`${base}/tags/print`);
    await owner.locator('[data-testid="tag-preview"][data-ready="true"]').nth(3).waitFor();
    await owner.screenshot({ path: path.join(OUT, "print-sheet.png"), fullPage: true });

    // Anonymous finder pages (fresh context, no cookies)
    const finderCtx = await browser.newContext(desktop);
    const finder = await finderCtx.newPage();
    await finder.goto(`${base}/t/DEMAD234`);
    await finder.getByLabel("Message to the owner").fill("Hi, I think I found your backpack near the canteen.");
    await shot(finder, "finder-page.png");
    await finder.goto(`${base}/t/DEMAB234`);
    await shot(finder, "finder-lost.png");

    const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const mobile = await mobileCtx.newPage();
    await mobile.goto(`${base}/t/DEMAB234`);
    await shot(mobile, "finder-mobile.png");

    await browser.close();
    console.log(`Screenshots saved to ${OUT}`);
  } finally {
    stop();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
