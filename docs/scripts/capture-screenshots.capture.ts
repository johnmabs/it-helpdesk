import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { E2E_USERS } from "../../e2e/fixtures";
import { createTicket, expectTicketStatus, loginAsAdmin } from "../../e2e/tickets/helpers";

const output = resolve(__dirname, "../screenshots");

async function capture(page: Page, name: string): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: resolve(output, `${name}.png`),
    fullPage: true,
    animations: "disabled",
    style: "nextjs-portal { visibility: hidden; }",
  });
}

test("capture the seven portfolio screens with fictional data", async ({ page }) => {
  await mkdir(output, { recursive: true });
  await page.goto("/login");
  await expect(page.getByRole("button", { name: "Se connecter" })).toBeVisible();
  await capture(page, "login");
  await loginAsAdmin(page);

  await createTicket(page, "Installer les outils du nouvel arrivant", "MEDIUM");
  await createTicket(page, "Connexion VPN indisponible", "CRITICAL");
  await page.getByLabel("Technicien").selectOption(E2E_USERS.technician.id);
  await page.getByRole("button", { name: "Assigner", exact: true }).click();
  await expectTicketStatus(page, "ASSIGNED", "CRITICAL");
  await page.getByRole("button", { name: "Commencer", exact: true }).click();
  await expectTicketStatus(page, "IN_PROGRESS", "CRITICAL");

  await createTicket(page, "Imprimante du service comptabilité indisponible");
  await page.getByLabel("Priorité").selectOption("CRITICAL");
  await page.getByRole("button", { name: "Modifier la priorité" }).click();
  await expectTicketStatus(page, "OPEN", "CRITICAL");
  await page.getByLabel("Technicien").selectOption(E2E_USERS.technician.id);
  await page.getByRole("button", { name: "Assigner", exact: true }).click();
  await expectTicketStatus(page, "ASSIGNED", "CRITICAL");
  await page.getByRole("button", { name: "Commencer", exact: true }).click();
  await expectTicketStatus(page, "IN_PROGRESS", "CRITICAL");
  await page.getByLabel("Ajouter un commentaire").fill(
    "Diagnostic : file d'impression bloquée. Redémarrage du service et impression de contrôle réussie.",
  );
  await page.getByRole("button", { name: "Publier le commentaire" }).click();
  await expect(page.getByText("Commentaire ajouté.", { exact: true })).toBeVisible();
  await capture(page, "ticket-details");
  await page.getByRole("button", { name: "Résoudre", exact: true }).click();
  await expectTicketStatus(page, "RESOLVED", "CRITICAL");
  await page.getByRole("button", { name: "Clôturer", exact: true }).click();
  await expectTicketStatus(page, "CLOSED", "CRITICAL");
  const history = page.locator("section").filter({
    has: page.getByRole("heading", { name: "Historique", exact: true }),
  });
  await expect(history.getByRole("listitem")).toHaveCount(7);
  await history.screenshot({ path: resolve(output, "history-timeline.png"), animations: "disabled" });

  for (const [route, name, heading] of [
    ["/dashboard", "dashboard", "Dashboard"],
    ["/dashboard/tickets", "ticket-list", "Tickets"],
    ["/dashboard/tickets/new", "new-ticket", "Nouveau ticket"],
    ["/dashboard/categories", "admin-categories", "Catégories"],
  ]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: heading, exact: true }).first()).toBeVisible();
    await capture(page, name);
  }
});
