import { UserNotFoundError } from "@/shared/errors/application-error";

import {
  AuthenticationUser,
  PersistUserInput,
  UserRepository,
  UserSessionState,
} from "../../domain/user-repository";
import { User } from "../../domain/user";

type StoredUser = {
  user: User;
  passwordHash: string;
  sessionVersion: number;
};

export class InMemoryUserRepository implements UserRepository {
  async findSessionState(userId: string): Promise<UserSessionState | null> {
    const stored = this.users.get(userId);

    if (!stored) {
      return null;
    }

    return {
      active: stored.user.active,
      sessionVersion: stored.sessionVersion,
    };
  }

  async revokeSessions(userId: string): Promise<void> {
    const stored = this.users.get(userId);

    if (!stored) {
      throw new UserNotFoundError();
    }

    this.users.set(userId, {
      ...stored,
      sessionVersion: stored.sessionVersion + 1,
    });
  }

  private readonly users = new Map<string, StoredUser>();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id)?.user ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();

    for (const stored of this.users.values()) {
      if (stored.user.email === normalizedEmail) {
        return stored.user;
      }
    }

    return null;
  }

  async findForAuthentication(
    email: string,
  ): Promise<AuthenticationUser | null> {
    const normalizedEmail = email.trim().toLowerCase();

    for (const stored of this.users.values()) {
      if (stored.user.email === normalizedEmail) {
        return {
          id: stored.user.id,
          email: stored.user.email,
          passwordHash: stored.passwordHash,
          role: stored.user.role,
          active: stored.user.active,
          sessionVersion: stored.sessionVersion,
        };
      }
    }

    return null;
  }

  async create(input: PersistUserInput): Promise<void> {
    this.users.set(input.user.id, {
      user: input.user,
      passwordHash: input.passwordHash,
      sessionVersion: 0,
    });
  }

  async save(user: User): Promise<void> {
    const stored = this.users.get(user.id);

    if (!stored) {
      throw new UserNotFoundError();
    }

    this.users.set(user.id, {
      ...stored,
      user,
    });
  }
}
