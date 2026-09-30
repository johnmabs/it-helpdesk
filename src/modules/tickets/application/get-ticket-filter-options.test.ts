import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserRole } from "@/modules/users/domain/user-role";

const mocks = vi.hoisted(() => ({
  categoryFindMany: vi.fn(),
  userFindMany: vi.fn(),
}));

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    category: {
      findMany: mocks.categoryFindMany,
    },
    user: {
      findMany: mocks.userFindMany,
    },
  },
}));

import { getTicketFilterOptions } from "./get-ticket-filter-options";

describe("getTicketFilterOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.categoryFindMany.mockResolvedValue([
      { id: "category-1", name: "Hardware" },
    ]);
    mocks.userFindMany
      .mockResolvedValueOnce([{ id: "technician-1", name: "Marc" }])
      .mockResolvedValueOnce([{ id: "requester-1", name: "Alice" }]);
  });

  it("returns categories, technicians and creators", async () => {
    await expect(
      getTicketFilterOptions({ id: "admin-1", role: UserRole.ADMIN }),
    ).resolves.toEqual({
      categories: [{ id: "category-1", name: "Hardware" }],
      technicians: [{ id: "technician-1", name: "Marc" }],
      creators: [{ id: "requester-1", name: "Alice" }],
    });

    expect(mocks.userFindMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: {
          role: {
            in: [UserRole.TECHNICIAN, UserRole.ADMIN],
          },
        },
      }),
    );
  });

  it("only exposes the current user as a creator option to standard users", async () => {
    await getTicketFilterOptions({
      id: "requester-1",
      role: UserRole.USER,
    });

    expect(mocks.userFindMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { id: "requester-1" },
      }),
    );
  });
});
