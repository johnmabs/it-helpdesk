import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    $transaction: mocks.transaction,
    ticket: {
      findMany: mocks.findMany,
    },
  },
}));

import { TicketStatus } from "../domain/ticket-status";
import { getTechnicianWorkload } from "./get-technician-workload";

describe("getTechnicianWorkload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.transaction.mockImplementation(
      async (queries: Array<Promise<unknown>>) => Promise.all(queries),
    );
    mocks.findMany
      .mockResolvedValueOnce([makeTicket("assigned-ticket")])
      .mockResolvedValueOnce([makeTicket("in-progress-ticket")])
      .mockResolvedValueOnce([makeTicket("resolved-ticket", true)]);
  });

  it("returns the technician's three workload views", async () => {
    await expect(getTechnicianWorkload("technician-1")).resolves.toEqual({
      assigned: [makeTicket("assigned-ticket")],
      inProgress: [makeTicket("in-progress-ticket")],
      recentlyResolved: [makeTicket("resolved-ticket", true)],
    });

    expect(mocks.findMany).toHaveBeenCalledTimes(3);
  });

  it("filters every view by the assigned technician", async () => {
    await getTechnicianWorkload("technician-1", 3);

    for (const [options] of mocks.findMany.mock.calls) {
      expect(options).toMatchObject({
        where: {
          assignedToId: "technician-1",
        },
        take: 3,
      });
    }
  });

  it("includes resolved and closed tickets in the recently resolved view", async () => {
    await getTechnicianWorkload("technician-1");

    expect(mocks.findMany).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        where: {
          assignedToId: "technician-1",
          status: {
            in: [TicketStatus.RESOLVED, TicketStatus.CLOSED],
          },
          resolvedAt: {
            not: null,
          },
        },
        orderBy: [{ resolvedAt: "desc" }, { id: "desc" }],
      }),
    );
  });
});

function makeTicket(id: string, resolved = false) {
  return {
    id,
    title: `Ticket ${id}`,
    priority: "HIGH",
    updatedAt: new Date("2026-09-30T10:00:00Z"),
    resolvedAt: resolved ? new Date("2026-09-30T09:30:00Z") : null,
  };
}
