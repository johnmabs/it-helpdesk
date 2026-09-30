import { expect, type Page } from "@playwright/test";

import { E2E_CATEGORY, E2E_PASSWORD, E2E_USERS } from "../fixtures";

type E2EUser = (typeof E2E_USERS)[keyof typeof E2E_USERS];

export async function loginAs(page: Page, user: E2EUser): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Mot de passe").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "Se connecter" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
}

export async function loginAsAdmin(page: Page): Promise<void> {
  await loginAs(page, E2E_USERS.admin);
}

export async function loginAsRequester(page: Page): Promise<void> {
  await loginAs(page, E2E_USERS.requester);
}

export async function loginAsTechnician(page: Page): Promise<void> {
  await loginAs(page, E2E_USERS.technician);
}

export async function createTicket(
  page: Page,
  title: string,
  priority = "HIGH",
): Promise<void> {
  await page.goto("/dashboard/tickets/new");
  await page.getByLabel("Titre").fill(title);
  await page
    .getByLabel("Description")
    .fill("Description créée par le scénario de test de bout en bout.");
  await page
    .getByLabel("Catégorie")
    .selectOption({ label: E2E_CATEGORY.name });
  await page.getByLabel("Priorité").selectOption(priority);
  await page.getByRole("button", { name: "Créer le ticket" }).click();

  await expect(page).toHaveURL(/\/dashboard\/tickets\/[^/]+$/);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
}

export async function expectTicketStatus(
  page: Page,
  status: string,
  priority = "HIGH",
): Promise<void> {
  await expect(
    page.getByText(`${status} · ${priority}`, { exact: true }),
  ).toBeVisible();
}
