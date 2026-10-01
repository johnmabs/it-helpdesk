import { expect, test } from "@playwright/test";

import {
  createTicket,
  loginAsRequester,
  loginAsTechnician,
} from "../tickets/helpers";

test("denies dashboard access to an anonymous user", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();
});

test("denies administration access to a standard user", async ({ page }) => {
  await loginAsRequester(page);

  await page.goto("/admin/categories");

  await expect(page).toHaveURL(/\/access-denied$/);
  await expect(
    page.getByRole("heading", { name: "Accès refusé" }),
  ).toBeVisible();
});

test("denies ticket assignment to a standard user", async ({ page }) => {
  await loginAsRequester(page);
  await createTicket(page, `E2E authorization ${Date.now()}`);

  await expect(page.getByRole("heading", { name: "Actions" })).toHaveCount(0);
  await expect(page.getByLabel("Technicien")).toHaveCount(0);
});

test("denies user administration access to a technician", async ({ page }) => {
  await loginAsTechnician(page);

  await page.goto("/dashboard/users");

  await expect(page).toHaveURL(/\/access-denied$/);
  await expect(
    page.getByRole("heading", { name: "Accès refusé" }),
  ).toBeVisible();
});
