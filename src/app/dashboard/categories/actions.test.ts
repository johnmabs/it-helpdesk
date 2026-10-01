import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createExecute: vi.fn(),
  revalidatePath: vi.fn(),
  requireCategoryAdministrator: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("./require-category-administrator", () => ({
  requireCategoryAdministrator: mocks.requireCategoryAdministrator,
}));

vi.mock("@/modules/categories/application/create-category", () => ({
  CreateCategory: class {
    execute = mocks.createExecute;
  },
}));

vi.mock("@/modules/categories/application/deactivate-category", () => ({
  DeactivateCategory: class {},
}));

vi.mock("@/modules/categories/application/update-category", () => ({
  UpdateCategory: class {},
}));

vi.mock(
  "@/modules/categories/infrastructure/persistence/prisma-category-repository",
  () => ({
    PrismaCategoryRepository: class {},
  }),
);

vi.mock("@/shared/identity/random-id-generator", () => ({
  RandomIdGenerator: class {},
}));

import { createCategoryAction } from "./actions";

const initialState = { error: "", message: "" };

describe("createCategoryAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes valid category input", async () => {
    const formData = new FormData();
    formData.set("name", "  Hardware  ");
    formData.set("description", "  Physical equipment  ");

    await expect(
      createCategoryAction(initialState, formData),
    ).resolves.toEqual({ error: "", message: "Catégorie créée." });
    expect(mocks.createExecute).toHaveBeenCalledWith({
      name: "Hardware",
      description: "Physical equipment",
    });
  });

  it("rejects an empty name before calling the use case", async () => {
    const formData = new FormData();
    formData.set("name", "   ");

    await expect(
      createCategoryAction(initialState, formData),
    ).resolves.toEqual({
      error: "Le nom de la catégorie est obligatoire.",
      message: "",
    });
    expect(mocks.createExecute).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
