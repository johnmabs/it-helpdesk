import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "./tickets/helpers";

for (const viewport of [
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`keeps the dashboard usable on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await loginAsAdmin(page);

    await expect(
      page.getByRole("navigation", { name: "Navigation principale" }),
    ).toBeVisible();

    await page.goto("/dashboard/tickets");

    await expect(page.getByRole("heading", { name: "Tickets" })).toBeVisible();
    await expect(page.getByLabel("Statut")).toBeVisible();

    const hasPageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );

    expect(hasPageOverflow).toBe(false);
  });
}
