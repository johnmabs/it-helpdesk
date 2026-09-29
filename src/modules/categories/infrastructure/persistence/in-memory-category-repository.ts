import { Category } from "../../domain/category";
import {
  CategoryRepository,
  FindCategoriesOptions,
} from "../../domain/category-repository";

export class InMemoryCategoryRepository implements CategoryRepository {
  private readonly categories = new Map<string, Category>();

  async findById(id: string): Promise<Category | null> {
    return this.categories.get(id) ?? null;
  }

  async findByName(name: string): Promise<Category | null> {
    const normalizedName = name.trim().toLocaleLowerCase();

    for (const category of this.categories.values()) {
      if (category.name.toLocaleLowerCase() === normalizedName) {
        return category;
      }
    }

    return null;
  }

  async findAll(options: FindCategoriesOptions = {}): Promise<Category[]> {
    return [...this.categories.values()]
      .filter((category) => !options.activeOnly || category.active)
      .sort((first, second) => first.name.localeCompare(second.name));
  }

  async save(category: Category): Promise<void> {
    this.categories.set(category.id, category);
  }
}
