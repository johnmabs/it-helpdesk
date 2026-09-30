import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserRole } from "@/modules/users/domain/user-role";

const mocks = vi.hoisted(() => ({
  count: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    ticket: {
      count: mocks.count,
      findMany: mocks.findMany,
    },
  },
}));

import { TicketPriority } from "../domain/ticket-priority";
import { TicketStatus } from "../domain/ticket-status";
import {
  listTickets,
  parseTicketListFilters,
  parseTicketListPage,
} from "./list-tickets";

describe("listTickets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.count.mockResolvedValue(0);
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

  it("loads only the requested page from the database", async () => {
    mocks.count.mockResolvedValue(45);

    const result = await listTickets(
      { id: "admin-1", role: UserRole.ADMIN },
      {},
      3,
    );

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: 40,
        take: 20,
      }),
    );
    expect(result).toEqual({
      items: [],
      total: 45,
      page: 3,
      pageSize: 20,
      totalPages: 3,
    });
  });

  it("clamps a page beyond the last available page", async () => {
    mocks.count.mockResolvedValue(45);

    const result = await listTickets(
      { id: "admin-1", role: UserRole.ADMIN },
      {},
      99,
    );

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 40, take: 20 }),
    );
    expect(result.page).toBe(3);
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

describe("parseTicketListPage", () => {
  it("parses a positive integer", () => {
    expect(parseTicketListPage("3")).toBe(3);
  });

  it.each([undefined, "", "0", "-1", "1.5", "unknown", ["2", "3"]])(
    "falls back to the first page for %j",
    (value) => {
      expect(parseTicketListPage(value)).toBe(1);
    },
  );
});
