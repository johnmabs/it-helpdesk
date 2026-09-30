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

import { TicketPriority } from "../domain/ticket-priority";
import { TicketStatus } from "../domain/ticket-status";
import { listTickets, parseTicketListFilters } from "./list-tickets";

describe("listTickets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findMany.mockResolvedValue([]);
  });

  it("applies every ticket filter", async () => {
    await listTickets(
      { id: "admin-1", role: UserRole.ADMIN },
      {
        status: TicketStatus.IN_PROGRESS,
        priority: TicketPriority.CRITICAL,
        categoryId: "category-1",
        assignedToId: "technician-1",
        createdById: "requester-1",
      },
    );

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: TicketStatus.IN_PROGRESS,
          priority: TicketPriority.CRITICAL,
          categoryId: "category-1",
          assignedToId: "technician-1",
          createdById: "requester-1",
        },
      }),
    );
  });

  it("keeps a standard user restricted to their own tickets", async () => {
    await listTickets(
      { id: "requester-1", role: UserRole.USER },
      { createdById: "another-user" },
    );

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          createdById: "requester-1",
        },
      }),
    );
  });

  it("supports filtering unassigned tickets", async () => {
    await listTickets(
      { id: "technician-1", role: UserRole.TECHNICIAN },
      { assignedToId: "unassigned" },
    );

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          assignedToId: null,
        },
      }),
    );
  });
});

describe("parseTicketListFilters", () => {
  it("parses valid filter values", () => {
    expect(
      parseTicketListFilters({
        status: "OPEN",
        priority: "HIGH",
        category: "category-1",
        assignee: "technician-1",
        creator: "requester-1",
      }),
    ).toEqual({
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      categoryId: "category-1",
      assignedToId: "technician-1",
      createdById: "requester-1",
    });
  });

  it("ignores invalid enum and repeated values", () => {
    expect(
      parseTicketListFilters({
        status: "UNKNOWN",
        priority: ["HIGH", "LOW"],
      }),
    ).toEqual({});
  });
});
