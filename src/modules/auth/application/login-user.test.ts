import { beforeEach, describe, expect, it } from "vitest";

import { User } from "@/modules/users/domain/user";
import { UserRole } from "@/modules/users/domain/user-role";
import { InMemoryUserRepository } from "@/modules/users/infrastructure/persistence/in-memory-user-repository";

import { LoginUser } from "./login-user";
import { FakePasswordHasher } from "../infrastructure/testing/fake-password-hasher";

describe("LoginUser", () => {
  let users: InMemoryUserRepository;
  let hasher: FakePasswordHasher;
  let loginUser: LoginUser;

  beforeEach(async () => {
    users = new InMemoryUserRepository();
    hasher = new FakePasswordHasher();

    loginUser = new LoginUser(users, hasher);

    const user = User.create({
      id: "user-1",
      email: "john@example.com",
      name: "John",
      role: UserRole.TECHNICIAN,
      active: true,
      createdAt: new Date(),
    });

    await users.create({
      user,
      passwordHash: await hasher.hash("password123"),
    });
  });

  it("authenticates a valid user", async () => {
    const result = await loginUser.execute({
      email: "john@example.com",
      password: "password123",
    });

    expect(result).toEqual({
      userId: "user-1",
      email: "john@example.com",
      role: UserRole.TECHNICIAN,
    });
  });

  it("rejects an invalid password", async () => {
    await expect(
      loginUser.execute({
        email: "john@example.com",
        password: "wrong-password",
      }),
    ).rejects.toThrow("Invalid credentials");
  });

  it("rejects an unknown user", async () => {
    await expect(
      loginUser.execute({
        email: "unknown@example.com",
        password: "password123",
      }),
    ).rejects.toThrow("Invalid credentials");
  });

  it("rejects an inactive user", async () => {
    const user = await users.findById("user-1");

    user!.deactivate();

    await users.save(user!);

    await expect(
      loginUser.execute({
        email: "john@example.com",
        password: "password123",
      }),
    ).rejects.toThrow("Invalid credentials");
  });
});
