import { expect, test } from "@playwright/test";

import { E2E_ADMIN_TICKET_ID } from "../fixtures";
import { loginAsRequester, loginAsTechnician } from "./helpers";

test("enforces requester permissions on protected resources", async ({
  page,
}) => {
  await loginAsRequester(page);

  const otherTicketResponse = await page.goto(
    `/dashboard/tickets/${E2E_ADMIN_TICKET_ID}`,
  );
  expect(otherTicketResponse?.status()).toBe(404);
});

test("allows a technician to operate on another user's ticket", async ({
  page,
}) => {
  await loginAsTechnician(page);
  await page.goto(`/dashboard/tickets/${E2E_ADMIN_TICKET_ID}`);

  await expect(
    page.getByRole("heading", { name: "Administrator-only ticket" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Actions" })).toBeVisible();
});
