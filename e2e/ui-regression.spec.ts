import { expect, test } from "@playwright/test";

import { E2E_CATEGORY } from "./fixtures";
import { loginAsAdmin } from "./tickets/helpers";

test("keeps the authenticated shell coherent across primary screens", async ({
  page,
}) => {
  await loginAsAdmin(page);

  const screens = [
    {
      path: "/dashboard",
      heading: "Dashboard",
      navigationItem: "Vue d’ensemble",
      title: "Dashboard | IT Helpdesk",
    },
    {
      path: "/dashboard/tickets",
      heading: "Tickets",
      navigationItem: "Tickets",
      title: "Tickets | IT Helpdesk",
    },
    {
      path: "/dashboard/tickets/new",
      heading: "Nouveau ticket",
      navigationItem: "Nouveau ticket",
      title: "Nouveau ticket | IT Helpdesk",
    },
    {
      path: "/dashboard/categories",
      heading: "Administration des catégories",
      navigationItem: "Catégories",
      title: "Catégories | IT Helpdesk",
    },
  ];

  for (const screen of screens) {
    await page.goto(screen.path);

    await expect(page).toHaveTitle(screen.title);
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: screen.heading, level: 1 }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("navigation", { name: "Navigation principale" })
        .getByRole("link", { name: screen.navigationItem }),
    ).toHaveAttribute("aria-current", "page");
  }
});

test("exposes the user menu to keyboard users", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/dashboard");

  const userMenu = page.locator(".user-menu summary");

  await userMenu.focus();
  await expect(userMenu).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(
    page.getByRole("button", { name: "Se déconnecter" }),
  ).toBeVisible();
  await expect(userMenu).toHaveCSS("outline-style", "solid");
});

test("offers a keyboard shortcut to reach the main content", async ({
  page,
}) => {
  await loginAsAdmin(page);
  await page.goto("/dashboard");

  const skipLink = page.getByRole("link", { name: "Aller au contenu" });

  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page.locator("#application-content")).toBeFocused();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("exposes understandable and accessible error feedback on forms", async ({
  page,
}) => {
  await loginAsAdmin(page);
  await page.goto("/dashboard/categories");

  const categoryName = page.locator("#new-category-name");
  const submitButton = page.locator(
    'form:has(#new-category-name) button[type="submit"]',
  );

  await categoryName.fill(E2E_CATEGORY.name);
  await submitButton.click();

  await expect(page.getByRole("alert")).toHaveText(
    "Une catégorie avec ce nom existe déjà.",
  );
  await expect(categoryName).toHaveAttribute("aria-invalid", "true");
  await expect(categoryName).toHaveAttribute(
    "aria-describedby",
    "create-category-feedback",
  );
});

test("keeps the ticket form reachable by keyboard on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loginAsAdmin(page);
  await page.goto("/dashboard/tickets/new");

  const title = page.getByLabel("Titre");
  const description = page.getByLabel("Description");
  const category = page.getByLabel("Catégorie");
  const priority = page.getByLabel("Priorité");
  const submitButton = page.getByRole("button", { name: "Créer le ticket" });

  await title.focus();
  await page.keyboard.press("Tab");
  await expect(description).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(category).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(priority).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(submitButton).toBeFocused();

  const buttonBox = await submitButton.boundingBox();

  expect(buttonBox).not.toBeNull();
  expect(buttonBox!.x).toBeGreaterThanOrEqual(0);
  expect(buttonBox!.x + buttonBox!.width).toBeLessThanOrEqual(390);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
  ).toBe(false);
});
