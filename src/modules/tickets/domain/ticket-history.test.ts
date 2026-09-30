import { describe, expect, it } from "vitest";

import { TicketHistoryAction } from "./ticket-history-action";
import { TicketHistory } from "./ticket-history";

const createdAt = new Date("2026-09-30T08:00:00Z");

describe("TicketHistory", () => {
  it.each(Object.values(TicketHistoryAction))(
    "creates a %s history entry",
    (action) => {
      const entry = TicketHistory.create({
        id: "history-1",
        ticketId: "ticket-1",
        actorId: "user-1",
        action,
        oldValue: "old-value",
        newValue: "new-value",
        createdAt,
      });

      expect(entry.id).toBe("history-1");
      expect(entry.ticketId).toBe("ticket-1");
      expect(entry.actorId).toBe("user-1");
      expect(entry.action).toBe(action);
      expect(entry.oldValue).toBe("old-value");
      expect(entry.newValue).toBe("new-value");
      expect(entry.createdAt).toBe(createdAt);
    },
  );

  it("defaults optional values to null", () => {
    const entry = TicketHistory.create({
      id: "history-1",
      ticketId: "ticket-1",
      actorId: "user-1",
      action: TicketHistoryAction.TICKET_CREATED,
      createdAt,
    });

    expect(entry.oldValue).toBeNull();
    expect(entry.newValue).toBeNull();
  });

  it("restores an existing history entry", () => {
    const entry = TicketHistory.restore({
      id: "history-1",
      ticketId: "ticket-1",
      actorId: "user-1",
      action: TicketHistoryAction.PRIORITY_CHANGED,
      oldValue: "LOW",
      newValue: "HIGH",
      createdAt,
    });

    expect(entry.action).toBe(TicketHistoryAction.PRIORITY_CHANGED);
    expect(entry.oldValue).toBe("LOW");
    expect(entry.newValue).toBe("HIGH");
  });
});
