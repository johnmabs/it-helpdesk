import { expect, test } from "@playwright/test";

import { createTicket, expectTicketStatus, loginAsAdmin } from "./helpers";

test("a ticket follows the complete lifecycle", async ({ page }) => {
  const title = `E2E lifecycle ${Date.now()}`;

  await loginAsAdmin(page);
  await createTicket(page, title);
  await expectTicketStatus(page, "OPEN");

  const technicianSelect = page.getByLabel("Technicien");
  const technicianId = await technicianSelect
    .locator("option:not([disabled])")
    .first()
    .getAttribute("value");

  expect(technicianId).toBeTruthy();
  await technicianSelect.selectOption(technicianId!);
  await page.getByRole("button", { name: "Assigner" }).click();
  await expectTicketStatus(page, "ASSIGNED");

  await page.getByRole("button", { name: "Commencer" }).click();
  await expectTicketStatus(page, "IN_PROGRESS");

  await page.getByRole("button", { name: "Résoudre" }).click();
  await expectTicketStatus(page, "RESOLVED");

  await page.getByRole("button", { name: "Clôturer" }).click();
  await expectTicketStatus(page, "CLOSED");
});
