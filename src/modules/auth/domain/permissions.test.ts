import { describe, expect, it } from "vitest";

import { UserRole } from "@/modules/users/domain/user-role";

import {
  canManageCategories,
  canManageTickets,
  canManageUsers,
  canViewTicket,
} from "./permissions";

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

  it("only staff can manage ticket workflow", () => {
    expect(canManageTickets(UserRole.USER)).toBe(false);
    expect(canManageTickets(UserRole.TECHNICIAN)).toBe(true);
    expect(canManageTickets(UserRole.ADMIN)).toBe(true);
  });

  it("allows a requester to view their own ticket", () => {
    expect(
      canViewTicket(
        { id: "requester-1", role: UserRole.USER },
        { createdById: "requester-1" },
      ),
    ).toBe(true);
  });

  it("prevents a requester from viewing another user's ticket", () => {
    expect(
      canViewTicket(
        { id: "requester-2", role: UserRole.USER },
        { createdById: "requester-1" },
      ),
    ).toBe(false);
  });

  it.each([UserRole.TECHNICIAN, UserRole.ADMIN])(
    "allows a %s to view any ticket",
    (role) => {
      expect(
        canViewTicket(
          { id: "staff-1", role },
          { createdById: "requester-1" },
        ),
      ).toBe(true);
    },
  );
});
