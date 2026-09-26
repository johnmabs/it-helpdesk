import { expect, test } from "@playwright/test";

test("shows application title", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "IT Helpdesk",
    }),
  ).toBeVisible();
});
