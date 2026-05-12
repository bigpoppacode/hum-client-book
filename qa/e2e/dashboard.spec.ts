import { test, expect } from "@playwright/test";

test.describe("[Dashboard]", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Clients" })).toBeVisible({
      timeout: 60_000,
    });
  });

  test("[US-DASH-001] list loads and badge reflects count", async ({
    page,
  }) => {
    await page.waitForFunction(() => {
      const el = document.body;
      return el && !el.textContent?.includes("Loading your client book");
    });
    const text = await page.locator(".text-3xl.font-black").first().innerText();
    const count = parseInt(text, 10);
    expect(Number.isFinite(count)).toBeTruthy();
    const cards = page.locator('a[href^="/dashboard/clients/"]:not([href$="/new"])');
    await expect(cards).toHaveCount(count);
  });

  test("[US-DASH-006] FAB navigates to add client form", async ({ page }) => {
    await page.getByRole("link", { name: /Add Client/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/clients\/new/);
    await expect(
      page.getByRole("heading", { name: "Add Client" })
    ).toBeVisible();
  });

  test("[US-DASH-002] search by name filters clients", async ({ page }) => {
    await page.goto("/dashboard/clients/new");
    const unique = `SearchName-${Date.now()}`;
    await page.locator("#name").fill(unique);
    await page.locator("#phone").fill("+15550001111");
    await page.getByRole("button", { name: "VIP" }).click();
    await page.getByRole("button", { name: /Save Client/i }).click();
    await page.waitForURL(/\/dashboard\/clients\//);

    await page.goto("/dashboard");
    await page.getByLabel("Search clients").fill(unique);
    await expect(
      page.getByRole("link", { name: new RegExp(unique) })
    ).toBeVisible();
  });

  test("[US-DASH-003] search by phone filters clients", async ({ page }) => {
    const phone = `+1555${String(Date.now()).slice(-7)}`;
    const cname = `Phone-${Date.now()}`;
    await page.goto("/dashboard/clients/new");
    await page.locator("#name").fill(cname);
    await page.locator("#phone").fill(phone);
    await page.getByRole("button", { name: /Save Client/i }).click();
    await page.waitForURL(/\/dashboard\/clients\//);

    await page.goto("/dashboard");
    const last4 = phone.replace(/\D/g, "").slice(-4);
    await page.getByLabel("Search clients").fill(last4);
    await expect(
      page.getByRole("link", { name: new RegExp(cname) })
    ).toBeVisible();
  });

  test("[US-DASH-004] filter by VIP and clear", async ({ page }) => {
    const respPromise = page.waitForResponse(
      (r) =>
        r.url().includes("/api/clients") && r.url().includes("group=VIP")
    );
    await page.getByRole("button", { name: "VIP", exact: true }).click();
    await respPromise;
    await page.getByRole("button", { name: /Clear All Filters/i }).click();
  });

  test("[US-DASH-005] sort select changes value", async ({ page }) => {
    const sort = page.getByLabel("Sort clients");
    await sort.selectOption("oldest");
    await expect(sort).toHaveValue("oldest");
    await sort.selectOption("rides");
    await expect(sort).toHaveValue("rides");
  });
});
