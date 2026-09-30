import { UserRepository } from "@/modules/users/domain/user-repository";
import { UserRole } from "@/modules/users/domain/user-role";
import { InvalidCredentialsError } from "@/shared/errors/application-error";

import { PasswordHasher } from "../domain/password-hasher";

export type LoginUserInput = {
  email: string;
  password: string;
};

export type LoginUserOutput = {
  userId: string;
  email: string;
  role: UserRole;
  sessionVersion: number;
};

export class LoginUser {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const user = await this.users.findForAuthentication(input.email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (!user.active) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.passwordHasher.verify(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionVersion: user.sessionVersion,
    };
  }
}
