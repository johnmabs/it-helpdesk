import { expect, test } from "@playwright/test";

import { createTicket, loginAsAdmin } from "./helpers";

test("comments are displayed chronologically on a ticket", async ({
  page,
}) => {
  const title = `E2E comments ${Date.now()}`;

  await loginAsAdmin(page);
  await createTicket(page, title);

  await expect(
    page.getByText("Aucun commentaire pour le moment."),
  ).toBeVisible();

  const commentField = page.getByLabel("Ajouter un commentaire");

  await commentField.fill("Premier commentaire");
  await page.getByRole("button", { name: "Publier le commentaire" }).click();
  await expect(
    page.getByText("Commentaire ajouté.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Premier commentaire")).toBeVisible();

  await commentField.fill("Deuxième commentaire");
  await page.getByRole("button", { name: "Publier le commentaire" }).click();
  await expect(page.getByText("Deuxième commentaire")).toBeVisible();

  await expect(
    page
      .getByRole("list", { name: "Commentaires du ticket" })
      .getByRole("listitem"),
  ).toHaveText([/Premier commentaire/, /Deuxième commentaire/]);
});
