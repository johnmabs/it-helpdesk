import { User } from "../../domain/user";
import { UserRole } from "../../domain/user-role";
import type {
  User as PrismaUser,
  UserRole as PrismaUserRole,
} from "@/generated/prisma/client";

export class UserMapper {
  static toDomain(raw: PrismaUser): User {
    return User.create({
      id: raw.id,
      email: raw.email,
      name: raw.name,
      role: UserMapper.toDomainRole(raw.role),
      active: raw.active,
      createdAt: raw.createdAt,
    });
  }

  private static toDomainRole(role: PrismaUserRole): UserRole {
    return UserRole[role];
  }
}
