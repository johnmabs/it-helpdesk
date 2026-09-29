import { Category } from "../domain/category";

export type CategoryOutput = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: Date;
};

export function toCategoryOutput(category: Category): CategoryOutput {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    active: category.active,
    createdAt: category.createdAt,
  };
}
