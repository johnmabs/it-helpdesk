import { expect, type Page } from "@playwright/test";

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required to run the ticket E2E tests`);
  }

  return value;
}

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(requiredEnvironmentVariable("SEED_ADMIN_EMAIL"));
  await page
    .getByLabel("Mot de passe")
    .fill(requiredEnvironmentVariable("SEED_ADMIN_PASSWORD"));
  await page.getByRole("button", { name: "Se connecter" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
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
  await expect(page.getByText(`${status} · ${priority}`, { exact: true })).toBeVisible();
}
