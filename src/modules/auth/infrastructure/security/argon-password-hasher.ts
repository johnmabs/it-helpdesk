import argon2 from "argon2";

import { PasswordHasher } from "../../domain/password-hasher";

export class ArgonPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async verify(password: string, passwordHash: string): Promise<boolean> {
    return argon2.verify(passwordHash, password);
  }
}
