import { describe, expect, it } from "vitest";

import { Category } from "./category";

const createdAt = new Date("2026-01-01T08:00:00Z");

function makeCategory(
  overrides: Partial<Parameters<typeof Category.create>[0]> = {},
): Category {
  return Category.create({
    id: "category-1",
    name: "Hardware",
    description: "Physical equipment",
    createdAt,
    ...overrides,
  });
}

describe("Category", () => {
  it("creates an active category", () => {
    const category = makeCategory();

    expect(category.id).toBe("category-1");
    expect(category.name).toBe("Hardware");
    expect(category.description).toBe("Physical equipment");
    expect(category.active).toBe(true);
    expect(category.createdAt).toBe(createdAt);
  });

  it("normalizes its name and description", () => {
    const category = makeCategory({
      name: "  Software  ",
      description: "  Applications and operating systems  ",
    });

    expect(category.name).toBe("Software");
    expect(category.description).toBe("Applications and operating systems");
  });

  it("accepts an omitted description", () => {
    const category = makeCategory({ description: undefined });

    expect(category.description).toBeNull();
  });

  it("normalizes an empty description to null", () => {
    const category = makeCategory({ description: "   " });

    expect(category.description).toBeNull();
  });

  it("rejects an empty name", () => {
    expect(() => makeCategory({ name: "   " })).toThrow(
      "Category name is required",
    );
  });

  it("updates its details", () => {
    const category = makeCategory();

    category.updateDetails("  Network  ", "  Connectivity services  ");

    expect(category.name).toBe("Network");
    expect(category.description).toBe("Connectivity services");
  });

  it("can be deactivated", () => {
    const category = makeCategory();

    category.deactivate();

    expect(category.active).toBe(false);
  });

  it("restores an existing inactive category", () => {
    const category = Category.restore({
      id: "category-1",
      name: "Legacy",
      description: null,
      active: false,
      createdAt,
    });

    expect(category.active).toBe(false);
  });
});
