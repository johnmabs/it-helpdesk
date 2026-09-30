import { PasswordHasher } from "@/modules/auth/domain/password-hasher";
import {
  UserEmailAlreadyExistsError,
  ValidationError,
} from "@/shared/errors/application-error";
import { IdGenerator } from "@/shared/identity/id-generator";

import { User } from "../domain/user";
import { UserRepository } from "../domain/user-repository";
import { UserRole } from "../domain/user-role";

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type CreateUserOutput = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export class CreateUser {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly idGenerator: IdGenerator,
  ) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    const email = input.email.trim().toLowerCase();

    const existingUser = await this.users.findByEmail(email);

    if (existingUser) {
      throw new UserEmailAlreadyExistsError();
    }

    if (input.password.length < 8) {
      throw new ValidationError(
        "Password must contain at least 8 characters",
        "INVALID_PASSWORD",
      );
    }

    const user = User.create({
      id: this.idGenerator.generate(),
      name: input.name,
      email,
      role: input.role,
      active: true,
      createdAt: new Date(),
    });

    const passwordHash = await this.passwordHasher.hash(input.password);

    await this.users.create({
      user,
      passwordHash,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
