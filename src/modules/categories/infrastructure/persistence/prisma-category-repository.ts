import { prisma } from "@/shared/database/prisma";

import { Category } from "../../domain/category";
import {
  CategoryRepository,
  FindCategoriesOptions,
} from "../../domain/category-repository";
import { CategoryMapper } from "./category-mapper";

export class PrismaCategoryRepository implements CategoryRepository {
  async findById(id: string): Promise<Category | null> {
    const raw = await prisma.category.findUnique({
      where: { id },
    });

    return raw ? CategoryMapper.toDomain(raw) : null;
  }

  async findByName(name: string): Promise<Category | null> {
    const raw = await prisma.category.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: "insensitive",
        },
      },
    });

    return raw ? CategoryMapper.toDomain(raw) : null;
  }

  async findAll(options: FindCategoriesOptions = {}): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      where: options.activeOnly ? { active: true } : undefined,
      orderBy: { name: "asc" },
    });

    return categories.map(CategoryMapper.toDomain);
  }

  async save(category: Category): Promise<void> {
    await prisma.category.upsert({
      where: { id: category.id },
      create: {
        id: category.id,
        name: category.name,
        description: category.description,
        active: category.active,
        createdAt: category.createdAt,
      },
      update: {
        name: category.name,
        description: category.description,
        active: category.active,
      },
    });
  }
}
