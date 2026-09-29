import type { Category as PrismaCategory } from "@/generated/prisma/client";

import { Category } from "../../domain/category";

export class CategoryMapper {
  static toDomain(raw: PrismaCategory): Category {
    return Category.restore({
      id: raw.id,
      name: raw.name,
      description: raw.description,
      active: raw.active,
      createdAt: raw.createdAt,
    });
  }
}
