import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserRole } from "@/modules/users/domain/user-role";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
}));

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    ticket: {
      findMany: mocks.findMany,
    },
  },
}));

import { listRecentTickets } from "./list-recent-tickets";

describe("listRecentTickets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findMany.mockResolvedValue([
      {
        id: "ticket-2",
        title: "Network unavailable",
        status: "IN_PROGRESS",
        priority: "CRITICAL",
        updatedAt: new Date("2026-09-30T10:00:00Z"),
        category: { name: "Network" },
        assignedTo: { name: "Marc" },
      },
      {
        id: "ticket-1",
        title: "Printer unavailable",
        status: "OPEN",
        priority: "MEDIUM",
        updatedAt: new Date("2026-09-30T09:00:00Z"),
        category: null,
        assignedTo: null,
      },
    ]);
  });

  it("returns the five most recently updated tickets by default", async () => {
    await expect(
      listRecentTickets({ id: "admin-1", role: UserRole.ADMIN }),
    ).resolves.toEqual([
      {
        id: "ticket-2",
        title: "Network unavailable",
        status: "IN_PROGRESS",
        priority: "CRITICAL",
        updatedAt: new Date("2026-09-30T10:00:00Z"),
        categoryName: "Network",
        assignedToName: "Marc",
      },
      {
        id: "ticket-1",
        title: "Printer unavailable",
        status: "OPEN",
        priority: "MEDIUM",
        updatedAt: new Date("2026-09-30T09:00:00Z"),
        categoryName: null,
        assignedToName: null,
      },
    ]);

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        take: 5,
      }),
    );
  });

  it("limits recent tickets to those visible by a standard user", async () => {
    await listRecentTickets(
      { id: "requester-1", role: UserRole.USER },
      3,
    );

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { createdById: "requester-1" },
        take: 3,
      }),
    );
  });
});
