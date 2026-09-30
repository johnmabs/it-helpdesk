import { describe, expect, it } from "vitest";

import { FixedIdGenerator } from "@/shared/identity/fixed-id-generator";

import { Ticket } from "../domain/ticket";
import { TicketHistoryAction } from "../domain/ticket-history-action";
import { TicketPriority } from "../domain/ticket-priority";
import { TicketStatus } from "../domain/ticket-status";
import { InMemoryTicketHistoryRepository } from "../infrastructure/persistence/in-memory-ticket-history-repository";
import { InMemoryTicketRepository } from "../infrastructure/persistence/in-memory-ticket-repository";
import { CancelTicket } from "./cancel-ticket";
import { TicketHistoryRecorder } from "./ticket-history-recorder";

describe("CancelTicket", () => {
  it("cancels a ticket and records the status change", async () => {
    const tickets = new InMemoryTicketRepository();
    const history = new InMemoryTicketHistoryRepository();
    await tickets.save(makeTicket());

    await new CancelTicket(
      tickets,
      new TicketHistoryRecorder(
        history,
        new FixedIdGenerator("history-1"),
      ),
    ).execute({ ticketId: "ticket-1", actorId: "admin-1" });

    expect((await tickets.findById("ticket-1"))?.status).toBe(
      TicketStatus.CANCELLED,
    );
    await expect(history.findByTicketId("ticket-1")).resolves.toMatchObject([
      {
        actorId: "admin-1",
        action: TicketHistoryAction.STATUS_CHANGED,
        oldValue: TicketStatus.OPEN,
        newValue: TicketStatus.CANCELLED,
      },
    ]);
  });
});

function makeTicket(): Ticket {
  return Ticket.create({
    id: "ticket-1",
    title: "Printer unavailable",
    description: "Printer does not respond",
    priority: TicketPriority.MEDIUM,
    createdById: "user-1",
    categoryId: "category-1",
    createdAt: new Date("2026-09-29T08:00:00Z"),
  });
}
