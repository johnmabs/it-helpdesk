import { UserRepository } from "@/modules/users/domain/user-repository";

import { PasswordHasher } from "../domain/password-hasher";

export type LoginUserInput = {
  email: string;
  password: string;
};

export type LoginUserOutput = {
  userId: string;
  email: string;
  role: string;
};

export class LoginUser {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const user = await this.users.findForAuthentication(input.email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.active) {
      throw new Error("Invalid credentials");
    }

    const passwordMatches = await this.passwordHasher.verify(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new Error("Invalid credentials");
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
