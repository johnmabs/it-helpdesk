import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserRole } from "@/modules/users/domain/user-role";

const mocks = vi.hoisted(() => ({
  count: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    $transaction: mocks.transaction,
    ticket: {
      count: mocks.count,
    },
  },
}));

import { getTicketSummaryMetrics } from "./get-ticket-summary-metrics";

describe("getTicketSummaryMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.transaction.mockImplementation(
      async (queries: Array<Promise<number>>) => Promise.all(queries),
    );
    mocks.count
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(5);
  });

  it("returns the five ticket indicators", async () => {
    await expect(
      getTicketSummaryMetrics(
        { id: "admin-1", role: UserRole.ADMIN },
        new Date("2026-09-30T12:00:00Z"),
      ),
    ).resolves.toEqual({
      open: 4,
      assigned: 3,
      inProgress: 2,
      critical: 1,
      resolvedToday: 5,
    });
  });

  it("limits every indicator to a standard user's tickets", async () => {
    await getTicketSummaryMetrics(
      { id: "requester-1", role: UserRole.USER },
      new Date("2026-09-30T12:00:00Z"),
    );

    expect(mocks.count).toHaveBeenCalledTimes(5);

    for (const [options] of mocks.count.mock.calls) {
      expect(options.where).toMatchObject({
        createdById: "requester-1",
      });
    }
  });

  it("counts resolutions within the current day", async () => {
    const now = new Date("2026-09-30T12:00:00Z");
    const expectedStart = new Date(now);
    expectedStart.setHours(0, 0, 0, 0);
    const expectedEnd = new Date(expectedStart);
    expectedEnd.setDate(expectedEnd.getDate() + 1);

    await getTicketSummaryMetrics(
      { id: "technician-1", role: UserRole.TECHNICIAN },
      now,
    );

    expect(mocks.count).toHaveBeenNthCalledWith(5, {
      where: {
        resolvedAt: {
          gte: expectedStart,
          lt: expectedEnd,
        },
      },
    });
  });
});
