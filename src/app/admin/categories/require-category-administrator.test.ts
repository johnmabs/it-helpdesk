import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserRole } from "@/modules/users/domain/user-role";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
  requireAuthenticatedUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/modules/auth/application/require-authenticated-user", () => ({
  requireAuthenticatedUser: mocks.requireAuthenticatedUser,
}));

import { requireCategoryAdministrator } from "./require-category-administrator";

describe("requireCategoryAdministrator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.redirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  it("allows an administrator", async () => {
    mocks.requireAuthenticatedUser.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      role: UserRole.ADMIN,
    });

    await expect(requireCategoryAdministrator()).resolves.toBeUndefined();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it.each([UserRole.USER, UserRole.TECHNICIAN])(
    "rejects the %s role",
    async (role) => {
      mocks.requireAuthenticatedUser.mockResolvedValue({
        id: "user-1",
        email: "user@example.com",
        role,
      });

      await expect(requireCategoryAdministrator()).rejects.toThrow(
        "NEXT_REDIRECT",
      );
      expect(mocks.redirect).toHaveBeenCalledWith("/access-denied");
    },
  );
});
