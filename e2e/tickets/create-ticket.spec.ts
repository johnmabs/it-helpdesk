import { expect, test } from "@playwright/test";

import { createTicket, expectTicketStatus, loginAsAdmin } from "./helpers";

test("an administrator can create an open ticket", async ({ page }) => {
  const title = `E2E creation ${Date.now()}`;

  await loginAsAdmin(page);
  await createTicket(page, title);

  await expect(page.getByText("Ticket créé.", { exact: true })).toBeVisible();
  await expectTicketStatus(page, "OPEN");
  await expect(
    page.getByText("Description créée par le scénario de test de bout en bout."),
  ).toBeVisible();
  await expect(page.getByText("Non assigné", { exact: true })).toBeVisible();
});
