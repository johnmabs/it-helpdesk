import {
  CategoryRepository,
  FindCategoriesOptions,
} from "../domain/category-repository";
import { CategoryOutput, toCategoryOutput } from "./category-output";

export class ListCategories {
  constructor(private readonly categories: CategoryRepository) {}

  async execute(
    options: FindCategoriesOptions = {},
  ): Promise<CategoryOutput[]> {
    const categories = await this.categories.findAll(options);

    return categories.map(toCategoryOutput);
  }
}
