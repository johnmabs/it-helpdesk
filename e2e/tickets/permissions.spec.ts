import { expect, test } from "@playwright/test";

import { E2E_ADMIN_TICKET_ID } from "../fixtures";
import {
  createTicket,
  loginAsRequester,
  loginAsTechnician,
} from "./helpers";

test("redirects an anonymous user away from protected pages", async ({
  page,
}) => {
  await page.goto("/dashboard/tickets");

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();
});

test("enforces requester permissions on protected resources", async ({
  page,
}) => {
  await loginAsRequester(page);
  await createTicket(page, `E2E requester ${Date.now()}`);

  await expect(page.getByRole("heading", { name: "Actions" })).toHaveCount(0);

  const categoryResponse = await page.goto("/admin/categories");
  expect(categoryResponse?.status()).toBe(404);

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
