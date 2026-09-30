import { expect, test } from "@playwright/test";

import { E2E_USERS } from "../fixtures";
import { createTicket, expectTicketStatus, loginAsAdmin } from "./helpers";

test("a ticket follows the complete lifecycle", async ({ page }) => {
  const title = `E2E lifecycle ${Date.now()}`;

  await loginAsAdmin(page);
  await createTicket(page, title);
  await expectTicketStatus(page, "OPEN");

  await page.getByLabel("Priorité").selectOption("CRITICAL");
  await page.getByRole("button", { name: "Modifier la priorité" }).click();
  await expectTicketStatus(page, "OPEN", "CRITICAL");

  const technicianSelect = page.getByLabel("Technicien");
  const technicianId = await technicianSelect
    .locator("option")
    .filter({ hasText: E2E_USERS.technician.name })
    .getAttribute("value");

  expect(technicianId).toBeTruthy();
  await technicianSelect.selectOption(technicianId!);
  await page.getByRole("button", { name: "Assigner" }).click();
  await expectTicketStatus(page, "ASSIGNED", "CRITICAL");

  await page.getByRole("button", { name: "Commencer" }).click();
  await expectTicketStatus(page, "IN_PROGRESS", "CRITICAL");

  await page.getByRole("button", { name: "Résoudre" }).click();
  await expectTicketStatus(page, "RESOLVED", "CRITICAL");

  await page.getByRole("button", { name: "Clôturer" }).click();
  await expectTicketStatus(page, "CLOSED", "CRITICAL");

  await expect(
    page
      .getByRole("list", { name: "Historique du ticket" })
      .getByRole("listitem"),
  ).toHaveText([
    /Ticket créé/,
    /Priorité HIGH → CRITICAL/,
    /Assigné à E2E Technician/,
    /ASSIGNED → IN_PROGRESS/,
    /IN_PROGRESS → RESOLVED/,
    /RESOLVED → CLOSED/,
  ]);
});
