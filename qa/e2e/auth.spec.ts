import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

function readCredentials() {
  const p = path.join(process.cwd(), "qa", ".auth", "credentials.json");
  return JSON.parse(fs.readFileSync(p, "utf8")) as {
    email: string;
    password: string;
    name: string;
  };
}

test.describe("[Auth]", () => {
  test("[US-AUTH-001] user can register with valid email and password", async ({
    page,
  }) => {
    const email = `reg-${Date.now()}@hum.qa`;
    await page.goto("/register");
    await page.locator("#name").fill("Register Test");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill("ValidPass123!");
    await page.getByRole("button", { name: "Create Account" }).click();
    await page.waitForURL("**/dashboard**", { timeout: 120_000 });
    await expect(page.getByRole("heading", { name: "Clients" })).toBeVisible();
  });

  test("[US-AUTH-002] user can login with valid credentials", async ({
    page,
  }) => {
    const { email, password } = readCredentials();
    await page.goto("/login");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("**/dashboard**", { timeout: 60_000 });
  });

  test("[US-AUTH-003] invalid login shows error", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill("nope@example.com");
    await page.locator("#password").fill("wrongpassword123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByRole("alert").first()).toContainText(/invalid/i);
  });

  test("[US-AUTH-004] session persists across reload", async ({ page }) => {
    const { email, password } = readCredentials();
    await page.goto("/login");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("**/dashboard**");
    await page.reload();
    await expect(page.getByRole("heading", { name: "Clients" })).toBeVisible();
  });

  test("[US-AUTH-005] logout redirects to login", async ({ page }) => {
    const { email, password } = readCredentials();
    await page.goto("/login");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("**/dashboard**");
    await page.goto("/dashboard/profile");
    await page.getByRole("button", { name: "Sign Out" }).click();
    await page.waitForURL("**/login**", { timeout: 60_000 });
  });

  test("[US-AUTH-002] protected route redirects when logged out", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
