import { describe, expect, it } from "vitest";

import { Ticket } from "../domain/ticket";
import { TicketPriority } from "../domain/ticket-priority";
import { InMemoryTicketRepository } from "../infrastructure/persistence/in-memory-ticket-repository";
import { ChangeTicketPriority } from "./change-ticket-priority";

describe("ChangeTicketPriority", () => {
  it("changes the priority of an active ticket", async () => {
    const tickets = new InMemoryTicketRepository();
    await tickets.save(makeTicket());

    await new ChangeTicketPriority(tickets).execute({
      ticketId: "ticket-1",
      priority: TicketPriority.CRITICAL,
    });

    expect((await tickets.findById("ticket-1"))?.priority).toBe(
      TicketPriority.CRITICAL,
    );
  });

  it("rejects an unknown ticket", async () => {
    const changePriority = new ChangeTicketPriority(
      new InMemoryTicketRepository(),
    );

    await expect(
      changePriority.execute({
        ticketId: "unknown-ticket",
        priority: TicketPriority.HIGH,
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
