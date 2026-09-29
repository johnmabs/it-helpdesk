import { Category } from "./category";

export type FindCategoriesOptions = {
  activeOnly?: boolean;
};

export interface CategoryRepository {
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  findAll(options?: FindCategoriesOptions): Promise<Category[]>;
  save(category: Category): Promise<void>;
}
