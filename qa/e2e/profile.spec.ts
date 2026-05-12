import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

function readCredentials() {
  const p = path.join(process.cwd(), "qa", ".auth", "credentials.json");
  return JSON.parse(fs.readFileSync(p, "utf8")) as { email: string; name: string };
}

test.describe("[Profile & Nav]", () => {
  test("[US-PROF-001] user info displays", async ({ page }) => {
    await page.goto("/dashboard/profile");
    await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible({
      timeout: 60_000,
    });
    const { email, name } = readCredentials();
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByText(name)).toBeVisible();
  });

  test("[US-PROF-002] sign out from profile", async ({ page }) => {
    await page.goto("/dashboard/profile");
    await page.getByRole("button", { name: "Sign Out" }).click();
    await page.waitForURL("**/login**");
  });

  test("[US-NAV-001] bottom nav tabs navigate", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: "Earnings" }).click();
    await expect(page).toHaveURL(/\/dashboard\/earnings/);
    await page.getByRole("link", { name: "Profile" }).click();
    await expect(page).toHaveURL(/\/dashboard\/profile/);
    await page.getByRole("link", { name: "Clients" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("[US-NAV-003] help modal opens on dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Help" }).first().click();
    await expect(
      page.getByRole("heading", { name: /How this works/i })
    ).toBeVisible();
    await page.getByRole("button", { name: "Got it" }).click();
  });
});
