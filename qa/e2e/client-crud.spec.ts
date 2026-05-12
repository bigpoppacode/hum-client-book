import { test, expect } from "@playwright/test";

test.describe("[Client CRUD]", () => {
  test("[US-CLIENT-001] add client with all fields", async ({ page }) => {
    await page.goto("/dashboard/clients/new");
    const name = `CRUD ${Date.now()}`;
    await page.locator("#name").fill(name);
    await page.locator("#phone").fill("+15554443322");
    await page.locator("#email").fill(`crud-${Date.now()}@example.com`);
    await page.getByRole("button", { name: "Regular", exact: true }).first().click();
    await page.getByRole("button", { name: "Airport", exact: true }).first().click();
    await page.locator("#defaultRate").fill("42.50");
    await page.locator("#notes").fill("VIP pickup notes");
    await page.getByRole("button", { name: /Save Client/i }).click();
    await page.waitForURL(/\/dashboard\/clients\//);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(name);
  });

  test("[US-CLIENT-002] add client validation for missing required", async ({
    page,
  }) => {
    await page.goto("/dashboard/clients/new");
    await page.locator("#phone").fill("+15551231234");
    const btn = page.getByRole("button", { name: /Save Client/i });
    const invalid = await btn.evaluate((el: HTMLButtonElement) => {
      const form = el.closest("form");
      return form ? !form.checkValidity() : false;
    });
    expect(invalid).toBeTruthy();
  });

  test("[US-CLIENT-003] detail shows sections", async ({ page }) => {
    await page.goto("/dashboard/clients/new");
    const name = `Detail-${Date.now()}`;
    await page.locator("#name").fill(name);
    await page.locator("#phone").fill("+15559876543");
    await page.getByRole("button", { name: /Save Client/i }).click();
    await page.waitForURL(/\/dashboard\/clients\//);
    await expect(page.getByText("Insights")).toBeVisible();
    await expect(page.getByText("Driver Notes")).toBeVisible();
    await expect(page.getByText("Ride History", { exact: false })).toBeVisible();
  });

  test("[US-CLIENT-004] contact links use tel and optional mailto", async ({
    page,
  }) => {
    await page.goto("/dashboard/clients/new");
    await page.locator("#name").fill(`Link-${Date.now()}`);
    await page.locator("#phone").fill("+15551112233");
    await page.locator("#email").fill("client-links@example.com");
    await page.getByRole("button", { name: /Save Client/i }).click();
    await page.waitForURL(/\/dashboard\/clients\//);
    await expect(
      page.locator(`a[href^="tel:"]`).first()
    ).toBeVisible();
    await expect(
      page.locator(`a[href^="mailto:"]`).first()
    ).toBeVisible();
  });

  test("[US-CLIENT-005] edit client updates name", async ({ page }) => {
    await page.goto("/dashboard/clients/new");
    const base = `EditBase-${Date.now()}`;
    await page.locator("#name").fill(base);
    await page.locator("#phone").fill("+15557778899");
    await page.getByRole("button", { name: /Save Client/i }).click();
    await page.waitForURL(/\/dashboard\/clients\//);

    await page.getByRole("link", { name: "Edit client" }).click();
    const updated = `${base}-updated`;
    await page.locator("#name").fill(updated);
    await page.getByRole("button", { name: /Save Changes/i }).click();
    await page.waitForURL(/\/dashboard\/clients\//);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      updated
    );
  });

  test("[US-CLIENT-006] delete client four-step flow", async ({ page }) => {
    await page.goto("/dashboard/clients/new");
    const name = `Delete-${Date.now()}`;
    await page.locator("#name").fill(name);
    await page.locator("#phone").fill("+15556665555");
    await page.getByRole("button", { name: /Save Client/i }).click();
    await page.waitForURL(/\/dashboard\/clients\//);

    await page.getByRole("button", { name: "Manage client" }).click();
    await expect(page.getByText("Danger Zone")).toBeVisible();
    await page.getByRole("button", { name: /Delete Client and All Rides/i }).click();
    await page.getByRole("button", { name: "Delete Permanently" }).click();
    await page.waitForURL("**/dashboard");
    await expect(page.getByText(name)).toHaveCount(0);
  });

  test("[US-CLIENT-007] client notes save", async ({ page }) => {
    await page.goto("/dashboard/clients/new");
    await page.locator("#name").fill(`Notes-${Date.now()}`);
    await page.locator("#phone").fill("+15553332222");
    await page.getByRole("button", { name: /Save Client/i }).click();
    await page.waitForURL(/\/dashboard\/clients\//);

    await page
      .getByPlaceholder("Add notes about this client...")
      .fill("Remember gate pickup");
    await page.getByRole("button", { name: /Save Notes/i }).click();
    await expect(page.getByText("Saved")).toBeVisible({ timeout: 10_000 });
  });
});
