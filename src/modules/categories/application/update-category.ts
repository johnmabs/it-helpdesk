import {
  CategoryNameAlreadyExistsError,
  CategoryNotFoundError,
} from "@/shared/errors/application-error";

import { CategoryRepository } from "../domain/category-repository";
import { CategoryOutput, toCategoryOutput } from "./category-output";

export type UpdateCategoryInput = {
  categoryId: string;
  name: string;
  description?: string | null;
};

export class UpdateCategory {
  constructor(private readonly categories: CategoryRepository) {}

  async execute(input: UpdateCategoryInput): Promise<CategoryOutput> {
    const category = await this.categories.findById(input.categoryId);

    if (!category) {
      throw new CategoryNotFoundError();
    }

    const categoryWithSameName = await this.categories.findByName(input.name);

    if (categoryWithSameName && categoryWithSameName.id !== category.id) {
      throw new CategoryNameAlreadyExistsError();
    }

    category.updateDetails(input.name, input.description);

    await this.categories.save(category);

    return toCategoryOutput(category);
  }
}
