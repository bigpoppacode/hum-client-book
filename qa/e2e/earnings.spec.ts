import { test, expect } from "@playwright/test";

test.describe("[Earnings]", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/earnings");
    await expect(page.getByRole("heading", { name: "Earnings" })).toBeVisible({
      timeout: 60_000,
    });
  });

  test("[US-EARN-001] period tabs switch", async ({ page }) => {
    for (const label of ["Today", "This Week", "This Month", "All Time"]) {
      await page.getByRole("button", { name: label }).click();
      await expect(page.getByRole("button", { name: label })).toBeVisible();
      await page.waitForFunction(() => {
        return !document.body.innerText.includes("Loading earnings");
      });
    }
  });

  test("[US-EARN-002] summary cards show numbers", async ({ page }) => {
    await page.waitForFunction(() => {
      return !document.body.innerText.includes("Loading earnings");
    });
    await expect(page.getByText("Total Earnings").first()).toBeVisible();
    await expect(
      page.locator(".text-3xl.font-black").first()
    ).toBeVisible();
  });

  test("[US-EARN-003] top client section renders", async ({ page }) => {
    await page.waitForFunction(() => {
      return !document.body.innerText.includes("Loading earnings");
    });
    await expect(page.getByText("Top Client").first()).toBeVisible();
  });

  test("[US-EARN-004] recent rides heading visible", async ({ page }) => {
    await page.waitForFunction(() => {
      return !document.body.innerText.includes("Loading earnings");
    });
    await expect(
      page.getByRole("heading", { name: "Recent Rides" })
    ).toBeVisible();
  });
});
