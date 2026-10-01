import { expect, test } from "@playwright/test";

test("shows application title", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "IT Helpdesk",
    }),
  ).toBeVisible();
});

test("shows the not-found state for an unknown page", async ({ page }) => {
  const response = await page.goto("/page-that-does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Page introuvable" }),
  ).toBeVisible();
});
