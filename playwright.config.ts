import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);

/** Smoke test against a production build and the local SQLite database. Run `npm run test:e2e`. */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  retries: 0,
  reporter: [["list"]],
  globalSetup: "./tests/e2e/global-setup.ts",
  use: { baseURL: `http://localhost:${PORT}`, browserName: "chromium", viewport: { width: 1440, height: 900 } },
  webServer: { command: `npx next start -p ${PORT}`, url: `http://localhost:${PORT}`, reuseExistingServer: false, timeout: 120_000 },
});
