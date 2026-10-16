import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { readEnvFile } from "../../scripts/env";

const DEMO_EMAIL = "demo@tagback.test";

test("owner creates a tag, finder messages anonymously, owner replies, finder sees the reply", async ({ browser }) => {
  const password = readEnvFile().DEMO_PASSWORD;
  expect(password, "run `npm run seed` first").toBeTruthy();

  // Owner logs in and creates a tag.
  const owner = await browser.newPage();
  await owner.goto("/login");
  await owner.getByLabel("Email").fill(DEMO_EMAIL);
  await owner.getByLabel("Password").fill(password);
  await owner.getByRole("button", { name: "Log in" }).click();
  await owner.waitForURL("**/dashboard");

  const itemName = `E2E umbrella ${Date.now()}`;
  await owner.goto("/tags/new");
  await owner.getByLabel("Item name").fill(itemName);
  await owner.getByRole("button", { name: /Round sticker/ }).click();
  await owner.getByRole("button", { name: "Create tag" }).click();
  await owner.waitForURL(/\/tags\/[0-9a-f-]{36}$/);
  const publicPath = await owner.locator('a[href^="/t/"]').first().getAttribute("href");
  expect(publicPath).toMatch(/^\/t\/[2-9A-HJKMNP-Z]{8}$/);

  // Export: the print-ready PDF downloads and is a real PDF.
  await owner.locator('[data-testid="tag-preview"][data-ready="true"]').waitFor();
  const [pdf] = await Promise.all([owner.waitForEvent("download"), owner.getByRole("button", { name: /Download PDF/ }).click()]);
  expect(pdf.suggestedFilename()).toMatch(/^tagback-[2-9A-HJKMNP-Z]{8}\.pdf$/);
  expect(readFileSync(await pdf.path()).subarray(0, 4).toString()).toBe("%PDF");

  // Anonymous finder (separate browser context, no cookies) opens the public page and writes.
  const finderContext = await browser.newContext();
  const finder = await finderContext.newPage();
  await finder.goto(publicPath!);
  await expect(finder.getByText("This item belongs to someone. Help return it!")).toBeVisible();
  await expect(finder.getByRole("heading", { name: itemName })).toBeVisible();
  expect(await finder.content()).not.toContain(DEMO_EMAIL); // owner identity never reaches the finder

  const finderMsg = "Found your umbrella at the bus stop.";
  await finder.getByLabel("Message to the owner").fill(finderMsg);
  await finder.getByRole("button", { name: "Send message" }).click();
  await expect(finder.getByTestId("finder-success")).toBeVisible();
  await finder.getByRole("link", { name: "Open chat" }).click();
  await finder.waitForURL(/\/chat\/[A-Za-z0-9_-]{32}$/);

  // Owner sees the message and replies.
  await owner.reload();
  const conversation = owner.getByTestId("conversation").first();
  await expect(conversation).toContainText(finderMsg);
  const ownerMsg = "Thank you! Can you leave it at the shop next to the stop?";
  await conversation.getByLabel("Reply").fill(ownerMsg);
  await conversation.getByRole("button", { name: "Send" }).click();
  await expect(conversation).toContainText(ownerMsg);

  // Finder's private chat shows the reply.
  await finder.reload();
  await expect(finder.getByTestId("message-thread")).toContainText(ownerMsg);
  expect(await finder.content()).not.toContain(DEMO_EMAIL);

  await finderContext.close();
});
