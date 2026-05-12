import { test, expect } from "@playwright/test";

test.describe("[Rides]", () => {
  test("[US-RIDE-001] log ride validation", async ({ page }) => {
    await page.goto("/dashboard/clients/new");
    await page.locator("#name").fill(`RideVal-${Date.now()}`);
    await page.locator("#phone").fill("+15554449999");
    await page.getByRole("button", { name: /Save Client/i }).click();
    await page.waitForURL(/\/dashboard\/clients\//);

    await page.getByRole("link", { name: /Log Ride|Log Another Ride/i }).click();
    await page.waitForURL(/\/rides\/new/);
    const submit = page.getByRole("button", { name: /Save Ride/i });
    const formInvalid = await submit.evaluate((el: HTMLButtonElement) => {
      const f = el.closest("form");
      return f ? !f.checkValidity() : false;
    });
    expect(formInvalid).toBeTruthy();
  });

  test("[US-RIDE-002] log ride saves and appears in history", async ({
    page,
  }) => {
    await page.goto("/dashboard/clients/new");
    await page.locator("#name").fill(`RideOk-${Date.now()}`);
    await page.locator("#phone").fill("+15553331111");
    await page.locator("#defaultRate").fill("28");
    await page.getByRole("button", { name: /Save Client/i }).click();
    await page.waitForURL(/\/dashboard\/clients\//);

    await page.getByRole("link", { name: /Log Ride|Log Another Ride/i }).click();
    await page.waitForURL(/\/rides\/new/);
    await page.locator("#pickupLocation").fill("123 Main St");
    await page.locator("#dropoffLocation").fill("456 Oak Ave");
    await page.locator("#fare").fill("28");
    await page.getByRole("button", { name: /Save Ride/i }).click();
    await expect(page.getByText(/Sent payment request/i)).toBeVisible({
      timeout: 15_000,
    });
    await page.waitForURL(/\/dashboard\/clients\//, { timeout: 120_000 });
    await expect(page.getByText("123 Main St")).toBeVisible();
  });

  test("[US-RIDE-003] Book Again prefills locations", async ({ page }) => {
    await page.goto("/dashboard/clients/new");
    await page.locator("#name").fill(`Book-${Date.now()}`);
    await page.locator("#phone").fill("+15552220000");
    await page.getByRole("button", { name: /Save Client/i }).click();
    await page.waitForURL(/\/dashboard\/clients\//);

    await page.getByRole("link", { name: /Log Ride|Log Another Ride/i }).click();
    await page.locator("#pickupLocation").fill("Hotel Lobby");
    await page.locator("#dropoffLocation").fill("Conference Center");
    await page.locator("#fare").fill("15");
    await page.getByRole("button", { name: /Save Ride/i }).click();
    await page.waitForURL(/\/dashboard\/clients\//, { timeout: 120_000 });

    await page.getByLabel("Book again").first().click();
    await expect(page.getByRole("heading", { name: "Book Again" })).toBeVisible();
    await expect(page.locator("#pickupLocation")).toHaveValue("Hotel Lobby");
    await expect(page.locator("#dropoffLocation")).toHaveValue(
      "Conference Center"
    );
  });

  test("[US-RIDE-004] fare prefills from default rate", async ({ page }) => {
    await page.goto("/dashboard/clients/new");
    await page.locator("#name").fill(`Rate-${Date.now()}`);
    await page.locator("#phone").fill("+15551110000");
    await page.locator("#defaultRate").fill("33.25");
    await page.getByRole("button", { name: /Save Client/i }).click();
    await page.waitForURL(/\/dashboard\/clients\//);

    await page.getByRole("link", { name: /Log Ride|Log Another Ride/i }).click();
    await page.waitForURL(/\/rides\/new/);
    await expect(page.locator("#fare")).toHaveValue("33.25");
  });

  test("[US-RIDE-005] payment toast sequence", async ({ page }) => {
    await page.goto("/dashboard/clients/new");
    await page.locator("#name").fill(`Toast-${Date.now()}`);
    await page.locator("#phone").fill("+15559990000");
    await page.getByRole("button", { name: /Save Client/i }).click();
    await page.waitForURL(/\/dashboard\/clients\//);

    await page.getByRole("link", { name: /Log Ride|Log Another Ride/i }).click();
    await page.waitForURL(/\/rides\/new/);
    await page.locator("#pickupLocation").fill("A");
    await page.locator("#dropoffLocation").fill("B");
    await page.locator("#fare").fill("10");
    await page.getByRole("button", { name: /Save Ride/i }).click();
    await expect(page.getByText(/Sent payment request/i)).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText(/Payment received/i)).toBeVisible({
      timeout: 20_000,
    });
  });
});
