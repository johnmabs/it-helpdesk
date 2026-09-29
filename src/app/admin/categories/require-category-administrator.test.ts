import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserRole } from "@/modules/users/domain/user-role";

const mocks = vi.hoisted(() => ({
  notFound: vi.fn(),
  requireAuthenticatedUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
}));

vi.mock("@/modules/auth/application/require-authenticated-user", () => ({
  requireAuthenticatedUser: mocks.requireAuthenticatedUser,
}));

import { requireCategoryAdministrator } from "./require-category-administrator";

describe("requireCategoryAdministrator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.notFound.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
  });

  it("allows an administrator", async () => {
    mocks.requireAuthenticatedUser.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      role: UserRole.ADMIN,
    });

    await expect(requireCategoryAdministrator()).resolves.toBeUndefined();
    expect(mocks.notFound).not.toHaveBeenCalled();
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
        "NEXT_NOT_FOUND",
      );
      expect(mocks.notFound).toHaveBeenCalledOnce();
    },
  );
});
