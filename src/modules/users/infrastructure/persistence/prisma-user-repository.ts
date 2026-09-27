import { prisma } from "@/shared/database/prisma";

import { User } from "../../domain/user";
import { UserRole } from "../../domain/user-role";
import {
  AuthenticationUser,
  PersistUserInput,
  UserRepository,
  UserSessionState,
} from "../../domain/user-repository";
import { UserMapper } from "./user-mapper";

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const raw = await prisma.user.findUnique({
      where: { id },
    });

    return raw ? UserMapper.toDomain(raw) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });

    return raw ? UserMapper.toDomain(raw) : null;
  }

  async findForAuthentication(
    email: string,
  ): Promise<AuthenticationUser | null> {
    const raw = await prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });

    if (!raw) {
      return null;
    }

    return {
      id: raw.id,
      email: raw.email,
      passwordHash: raw.passwordHash,
      role: UserRole[raw.role],
      active: raw.active,
      sessionVersion: raw.sessionVersion,
    };
  }

  async findSessionState(userId: string): Promise<UserSessionState | null> {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        active: true,
        sessionVersion: true,
      },
    });
  }

  async revokeSessions(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        sessionVersion: {
          increment: 1,
        },
      },
    });
  }

  async create(input: PersistUserInput): Promise<void> {
    await prisma.user.create({
      data: {
        id: input.user.id,
        email: input.user.email,
        name: input.user.name,
        passwordHash: input.passwordHash,
        role: input.user.role,
        active: input.user.active,
        createdAt: input.user.createdAt,
      },
    });
  }

  async save(user: User): Promise<void> {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: user.email,
        name: user.name,
        role: user.role,
        active: user.active,
      },
    });
  }
}
