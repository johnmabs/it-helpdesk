import { beforeEach, describe, expect, it } from "vitest";

import { FixedIdGenerator } from "@/shared/identity/fixed-id-generator";

import { Category } from "../domain/category";
import { InMemoryCategoryRepository } from "../infrastructure/persistence/in-memory-category-repository";
import { CreateCategory } from "./create-category";
import { DeactivateCategory } from "./deactivate-category";
import { ListCategories } from "./list-categories";
import { UpdateCategory } from "./update-category";

describe("category management", () => {
  let categories: InMemoryCategoryRepository;

  beforeEach(() => {
    categories = new InMemoryCategoryRepository();
  });

  it("creates a category", async () => {
    const createCategory = new CreateCategory(
      categories,
      new FixedIdGenerator("category-1"),
    );

    const result = await createCategory.execute({
      name: "  Hardware  ",
      description: "  Physical equipment  ",
    });

    expect(result).toMatchObject({
      id: "category-1",
      name: "Hardware",
      description: "Physical equipment",
      active: true,
    });
    await expect(categories.findById("category-1")).resolves.toMatchObject({
      name: "Hardware",
    });
  });

  it("rejects a duplicate category name regardless of case", async () => {
    await categories.save(makeCategory("category-1", "Hardware"));
    const createCategory = new CreateCategory(
      categories,
      new FixedIdGenerator("category-2"),
    );

    await expect(
      createCategory.execute({ name: "  HARDWARE  " }),
    ).rejects.toThrow("Category name already exists");
  });

  it("updates a category", async () => {
    await categories.save(makeCategory("category-1", "Hardware"));

    const result = await new UpdateCategory(categories).execute({
      categoryId: "category-1",
      name: "Network",
      description: "Connectivity services",
    });

    expect(result).toMatchObject({
      id: "category-1",
      name: "Network",
      description: "Connectivity services",
    });
  });

  it("rejects updating an unknown category", async () => {
    await expect(
      new UpdateCategory(categories).execute({
        categoryId: "unknown-category",
        name: "Network",
      }),
    ).rejects.toThrow("Category not found");
  });

  it("rejects updating to another category's name", async () => {
    await categories.save(makeCategory("category-1", "Hardware"));
    await categories.save(makeCategory("category-2", "Network"));

    await expect(
      new UpdateCategory(categories).execute({
        categoryId: "category-2",
        name: "hardware",
      }),
    ).rejects.toThrow("Category name already exists");
  });

  it("deactivates a category without removing it", async () => {
    await categories.save(makeCategory("category-1", "Hardware"));

    await new DeactivateCategory(categories).execute("category-1");

    const category = await categories.findById("category-1");
    expect(category?.active).toBe(false);
  });

  it("rejects deactivating an unknown category", async () => {
    await expect(
      new DeactivateCategory(categories).execute("unknown-category"),
    ).rejects.toThrow("Category not found");
  });

  it("lists categories alphabetically and can exclude inactive ones", async () => {
    const inactiveCategory = makeCategory("category-1", "Software");
    inactiveCategory.deactivate();

    await categories.save(inactiveCategory);
    await categories.save(makeCategory("category-2", "Hardware"));

    const listCategories = new ListCategories(categories);

    await expect(listCategories.execute()).resolves.toMatchObject([
      { name: "Hardware", active: true },
      { name: "Software", active: false },
    ]);
    await expect(
      listCategories.execute({ activeOnly: true }),
    ).resolves.toMatchObject([{ name: "Hardware", active: true }]);
  });
});

function makeCategory(id: string, name: string): Category {
  return Category.create({
    id,
    name,
    createdAt: new Date("2026-01-01T08:00:00Z"),
  });
}
