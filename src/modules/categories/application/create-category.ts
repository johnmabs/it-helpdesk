import { IdGenerator } from "@/shared/identity/id-generator";

import { Category } from "../domain/category";
import { CategoryRepository } from "../domain/category-repository";
import { CategoryOutput, toCategoryOutput } from "./category-output";

export type CreateCategoryInput = {
  name: string;
  description?: string | null;
};

export class CreateCategory {
  constructor(
    private readonly categories: CategoryRepository,
    private readonly idGenerator: IdGenerator,
  ) {}

  async execute(input: CreateCategoryInput): Promise<CategoryOutput> {
    const existingCategory = await this.categories.findByName(input.name);

    if (existingCategory) {
      throw new Error("Category name already exists");
    }

    const category = Category.create({
      id: this.idGenerator.generate(),
      name: input.name,
      description: input.description,
      createdAt: new Date(),
    });

    await this.categories.save(category);

    return toCategoryOutput(category);
  }
}
