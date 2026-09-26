import { describe, expect, it } from "vitest";

import { User } from "../../domain/user";
import { UserRole } from "../../domain/user-role";
import { InMemoryUserRepository } from "./in-memory-user-repository";

function makeUser() {
  return User.create({
    id: "user-1",
    email: "john@example.com",
    name: "John",
    role: UserRole.USER,
    active: true,
    createdAt: new Date(),
  });
}

const PASSWORD_HASH = "hashed-password";

describe("InMemoryUserRepository", () => {
  it("creates and retrieves a user by id", async () => {
    const repository = new InMemoryUserRepository();
    const user = makeUser();

    await repository.create({ user, passwordHash: PASSWORD_HASH });

    const storedUser = await repository.findById("user-1");

    expect(storedUser).toBe(user);
  });

  it("finds a user by email", async () => {
    const repository = new InMemoryUserRepository();
    const user = makeUser();

    await repository.create({ user, passwordHash: PASSWORD_HASH });

    const storedUser = await repository.findByEmail("JOHN@EXAMPLE.COM");

    expect(storedUser).toBe(user);
  });

  it("returns null when findById does not match", async () => {
    const repository = new InMemoryUserRepository();

    const storedUser = await repository.findById("unknown-id");

    expect(storedUser).toBeNull();
  });

  it("returns null when findByEmail does not match", async () => {
    const repository = new InMemoryUserRepository();

    const storedUser = await repository.findByEmail("unknown@example.com");

    expect(storedUser).toBeNull();
  });

  it("finds authentication data by email, including the password hash", async () => {
    const repository = new InMemoryUserRepository();
    const user = makeUser();

    await repository.create({ user, passwordHash: PASSWORD_HASH });

    const authUser = await repository.findForAuthentication("JOHN@EXAMPLE.COM");

    expect(authUser).toEqual({
      id: user.id,
      email: user.email,
      passwordHash: PASSWORD_HASH,
      role: user.role,
      active: user.active,
    });
  });

  it("returns null when findForAuthentication does not match", async () => {
    const repository = new InMemoryUserRepository();

    const authUser = await repository.findForAuthentication(
      "unknown@example.com",
    );

    expect(authUser).toBeNull();
  });

  it("updates an existing user via save, keeping the password hash", async () => {
    const repository = new InMemoryUserRepository();
    const user = makeUser();

    await repository.create({ user, passwordHash: PASSWORD_HASH });

    const updatedUser = User.create({
      id: user.id,
      email: user.email,
      name: "John Updated",
      role: UserRole.USER,
      active: false,
      createdAt: user.createdAt,
    });

    await repository.save(updatedUser);

    const storedUser = await repository.findById("user-1");
    const authUser = await repository.findForAuthentication(user.email);

    expect(storedUser).toBe(updatedUser);
    expect(authUser?.passwordHash).toBe(PASSWORD_HASH);
    expect(authUser?.active).toBe(false);
  });

  it("throws when saving a user that was never created", async () => {
    const repository = new InMemoryUserRepository();
    const user = makeUser();

    await expect(repository.save(user)).rejects.toThrow("User not found");
  });
});
