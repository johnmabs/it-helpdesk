import { describe, expect, it } from "vitest";

import { User } from "./user";
import { UserRole } from "./user-role";

function makeUser(overrides: Partial<Parameters<typeof User.create>[0]> = {}) {
  return User.create({
    id: "user-1",
    email: "john@example.com",
    name: "John",
    role: UserRole.USER,
    active: true,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  });
}

describe("User", () => {
  it("creates a user", () => {
    const user = makeUser();

    expect(user.id).toBe("user-1");
    expect(user.email).toBe("john@example.com");
    expect(user.name).toBe("John");
    expect(user.role).toBe(UserRole.USER);
    expect(user.active).toBe(true);
  });

  it("normalizes the email address", () => {
    const user = makeUser({
      email: "  John@Example.com  ",
    });

    expect(user.email).toBe("john@example.com");
  });

  it("trims the user name", () => {
    const user = makeUser({
      name: "  John Doe  ",
    });

    expect(user.name).toBe("John Doe");
  });

  it("rejects an empty email", () => {
    expect(() =>
      makeUser({
        email: "   ",
      }),
    ).toThrow("User email is required");
  });

  it("rejects an empty name", () => {
    expect(() =>
      makeUser({
        name: "   ",
      }),
    ).toThrow("User name is required");
  });

  it("can be deactivated", () => {
    const user = makeUser();

    user.deactivate();

    expect(user.active).toBe(false);
  });

  it("can be activated", () => {
    const user = makeUser({
      active: false,
    });

    user.activate();

    expect(user.active).toBe(true);
  });

  it("can change role", () => {
    const user = makeUser();

    user.changeRole(UserRole.TECHNICIAN);

    expect(user.role).toBe(UserRole.TECHNICIAN);
  });
});
