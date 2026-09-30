import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserRole } from "@/modules/users/domain/user-role";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
}));

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    category: {
      findMany: mocks.findMany,
    },
  },
}));

import { getTicketCategoryMetrics } from "./get-ticket-category-metrics";

describe("getTicketCategoryMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findMany.mockResolvedValue([
      {
        id: "category-hardware",
        name: "Hardware",
        _count: { tickets: 4 },
      },
      {
        id: "category-network",
        name: "Network",
        _count: { tickets: 7 },
      },
    ]);
  });

  it("returns ticket counts by category", async () => {
    await expect(
      getTicketCategoryMetrics({ id: "admin-1", role: UserRole.ADMIN }),
    ).resolves.toEqual([
      { id: "category-hardware", name: "Hardware", ticketCount: 4 },
      { id: "category-network", name: "Network", ticketCount: 7 },
    ]);

    expect(mocks.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            tickets: {
              where: {},
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  });

  it("only counts tickets visible to a standard user", async () => {
    await getTicketCategoryMetrics({
      id: "requester-1",
      role: UserRole.USER,
    });

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          _count: {
            select: {
              tickets: {
                where: {
                  createdById: "requester-1",
                },
              },
            },
          },
        }),
      }),
    );
  });

  it("keeps configured categories that do not contain tickets", async () => {
    mocks.findMany.mockResolvedValue([
      {
        id: "category-access",
        name: "Access",
        _count: { tickets: 0 },
      },
    ]);

    await expect(
      getTicketCategoryMetrics({ id: "admin-1", role: UserRole.ADMIN }),
    ).resolves.toEqual([
      { id: "category-access", name: "Access", ticketCount: 0 },
    ]);
  });

  it("returns an empty list when no category is configured", async () => {
    mocks.findMany.mockResolvedValue([]);

    await expect(
      getTicketCategoryMetrics({ id: "admin-1", role: UserRole.ADMIN }),
    ).resolves.toEqual([]);
  });
});
