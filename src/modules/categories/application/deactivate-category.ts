import { CategoryRepository } from "../domain/category-repository";

export class DeactivateCategory {
  constructor(private readonly categories: CategoryRepository) {}

  async execute(categoryId: string): Promise<void> {
    const category = await this.categories.findById(categoryId);

    if (!category) {
      throw new Error("Category not found");
    }

    category.deactivate();

    await this.categories.save(category);
  }
}
