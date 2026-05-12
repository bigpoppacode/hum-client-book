import { test as setup, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const authDir = path.join(__dirname, "..", ".auth");
const authFile = path.join(authDir, "user.json");
const credFile = path.join(authDir, "credentials.json");

setup("register and save session", async ({ page }) => {
  fs.mkdirSync(authDir, { recursive: true });

  const email = `e2e-${Date.now()}@hum.qa`;
  const password = "E2ETestPassword123!";
  const name = "QA E2E User";

  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();

  await page.locator("#name").fill(name);
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Create Account" }).click();

  await page.waitForURL("**/dashboard**", { timeout: 120_000 });

  await page.context().storageState({ path: authFile });
  fs.writeFileSync(credFile, JSON.stringify({ email, password, name }, null, 2), "utf8");
});
