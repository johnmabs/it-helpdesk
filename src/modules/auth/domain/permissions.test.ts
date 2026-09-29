import { describe, expect, it } from "vitest";

import { UserRole } from "@/modules/users/domain/user-role";

import { canManageCategories, canManageUsers } from "./permissions";

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

  it("only ADMIN can manage categories", () => {
    expect(canManageCategories(UserRole.USER)).toBe(false);
    expect(canManageCategories(UserRole.TECHNICIAN)).toBe(false);
    expect(canManageCategories(UserRole.ADMIN)).toBe(true);
  });
});
