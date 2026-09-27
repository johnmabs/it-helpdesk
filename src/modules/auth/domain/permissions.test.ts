import { describe, expect, it } from "vitest";

import { UserRole } from "@/modules/users/domain/user-role";

import { canManageUsers } from "./permissions";

describe("role-based permissions", () => {
  it("USER cannot manage users", () => {
    expect(canManageUsers(UserRole.USER)).toBe(false);
  });

  it("TECHNICIAN cannot manage users", () => {
    expect(canManageUsers(UserRole.TECHNICIAN)).toBe(false);
  });

  it("ADMIN can manage users", () => {
    expect(canManageUsers(UserRole.ADMIN)).toBe(true);
  });
});
