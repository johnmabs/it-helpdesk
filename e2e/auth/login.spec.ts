import { expect, test } from "@playwright/test";

import { E2E_USERS } from "../fixtures";
import { loginAsAdmin } from "../tickets/helpers";

test("rejects invalid credentials", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(E2E_USERS.admin.email);
  await page.getByLabel("Mot de passe").fill("incorrect-password");
  await page.getByRole("button", { name: "Se connecter" }).click();

  await expect(page.getByRole("alert")).toHaveText(
    "Email ou mot de passe incorrect.",
  );
  await expect(page).toHaveURL(/\/login$/);
});

test("authenticates and signs out an administrator", async ({ page }) => {
  await loginAsAdmin(page);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.getByRole("button", { name: "Se déconnecter" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();
});
