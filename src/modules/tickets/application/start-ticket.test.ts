import { describe, expect, it } from "vitest";
import { FixedIdGenerator } from "@/shared/identity/fixed-id-generator";

import { Ticket } from "../domain/ticket";
import { TicketHistoryAction } from "../domain/ticket-history-action";
import { TicketPriority } from "../domain/ticket-priority";
import { TicketStatus } from "../domain/ticket-status";
import { InMemoryTicketHistoryRepository } from "../infrastructure/persistence/in-memory-ticket-history-repository";
import { InMemoryTicketRepository } from "../infrastructure/persistence/in-memory-ticket-repository";
import { StartTicket } from "./start-ticket";
import { TicketHistoryRecorder } from "./ticket-history-recorder";

describe("StartTicket", () => {
  it("starts an assigned ticket", async () => {
    const tickets = new InMemoryTicketRepository();
    const history = new InMemoryTicketHistoryRepository();
    await tickets.save(makeTicket());

    const ticket = await tickets.findById("ticket-1");
    ticket!.assignTo("tech-1", new Date());
    await tickets.save(ticket!);

    await new StartTicket(
      tickets,
      new TicketHistoryRecorder(
        history,
        new FixedIdGenerator("history-1"),
      ),
    ).execute({ ticketId: "ticket-1", actorId: "tech-1" });

    expect((await tickets.findById("ticket-1"))?.status).toBe(
      TicketStatus.IN_PROGRESS,
    );
    await expect(history.findByTicketId("ticket-1")).resolves.toMatchObject([
      {
        actorId: "tech-1",
        action: TicketHistoryAction.STATUS_CHANGED,
        oldValue: TicketStatus.ASSIGNED,
        newValue: TicketStatus.IN_PROGRESS,
      },
    ]);
  });

  it("rejects an unknown ticket", async () => {
    const startTicket = new StartTicket(
      new InMemoryTicketRepository(),
      new TicketHistoryRecorder(
        new InMemoryTicketHistoryRepository(),
        new FixedIdGenerator("history-1"),
      ),
    );

    await expect(
      startTicket.execute({
        ticketId: "unknown-ticket",
        actorId: "tech-1",
      }),
    ).rejects.toThrow("Ticket not found");
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
