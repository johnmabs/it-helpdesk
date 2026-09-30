import { beforeEach, describe, expect, it, vi } from "vitest";

import { CategoryInactiveError } from "@/shared/errors/application-error";

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  redirect: vi.fn(),
  requireAuthenticatedUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/modules/auth/application/require-authenticated-user", () => ({
  requireAuthenticatedUser: mocks.requireAuthenticatedUser,
}));

vi.mock("@/modules/tickets/application/create-ticket", () => ({
  CreateTicket: class {
    execute = mocks.execute;
  },
}));

vi.mock(
  "@/modules/tickets/infrastructure/persistence/prisma-ticket-repository",
  () => ({
    PrismaTicketRepository: class {},
  }),
);

vi.mock(
  "@/modules/categories/infrastructure/persistence/prisma-category-repository",
  () => ({
    PrismaCategoryRepository: class {},
  }),
);

vi.mock(
  "@/modules/tickets/infrastructure/persistence/prisma-ticket-history-repository",
  () => ({
    PrismaTicketHistoryRepository: class {},
  }),
);

vi.mock("@/shared/identity/random-id-generator", () => ({
  RandomIdGenerator: class {},
}));

import { createTicketAction } from "./actions";

function validFormData(): FormData {
  const formData = new FormData();
  formData.set("title", "Écran cassé");
  formData.set("description", "L'écran du poste ne s'allume plus.");
  formData.set("priority", "HIGH");
  formData.set("categoryId", "category-1");

  return formData;
}

describe("createTicketAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuthenticatedUser.mockResolvedValue({ id: "user-1" });
  });

  it("laisse Next.js rediriger après la création du ticket", async () => {
    const redirectError = new Error("NEXT_REDIRECT");
    mocks.execute.mockResolvedValue({ id: "ticket-1", status: "OPEN" });
    mocks.redirect.mockImplementation(() => {
      throw redirectError;
    });

    await expect(
      createTicketAction({ error: "" }, validFormData()),
    ).rejects.toBe(redirectError);

    expect(mocks.redirect).toHaveBeenCalledWith(
      "/dashboard/tickets/ticket-1",
    );
    expect(mocks.execute).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: "category-1" }),
    );
  });

  it("retourne une erreur lorsque la création échoue", async () => {
    mocks.execute.mockRejectedValue(new Error("database unavailable"));

    await expect(
      createTicketAction({ error: "" }, validFormData()),
    ).resolves.toEqual({ error: "Impossible de créer le ticket." });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("retourne une erreur lorsque la catégorie est inactive", async () => {
    mocks.execute.mockRejectedValue(new CategoryInactiveError());

    await expect(
      createTicketAction({ error: "" }, validFormData()),
    ).resolves.toEqual({
      error: "La catégorie sélectionnée n'est plus disponible.",
    });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("rejette une priorité inconnue avant d'appeler le cas d'usage", async () => {
    const formData = validFormData();
    formData.set("priority", "URGENT");

    await expect(
      createTicketAction({ error: "" }, formData),
    ).resolves.toEqual({ error: "Priorité invalide." });
    expect(mocks.execute).not.toHaveBeenCalled();
  });
});
