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

describe("InMemoryUserRepository", () => {
  it("saves and retrieves a user", async () => {
    const repository = new InMemoryUserRepository();
    const user = makeUser();

    await repository.save(user);

    const storedUser = await repository.findById("user-1");

    expect(storedUser).toBe(user);
  });

  it("finds a user by email", async () => {
    const repository = new InMemoryUserRepository();
    const user = makeUser();

    await repository.save(user);

    const storedUser = await repository.findByEmail("JOHN@EXAMPLE.COM");

    expect(storedUser).toBe(user);
  });
});
