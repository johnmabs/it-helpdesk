import { describe, expect, it } from "vitest";

import { FixedIdGenerator } from "@/shared/identity/fixed-id-generator";

import { TicketPriority } from "../domain/ticket-priority";
import { InMemoryTicketRepository } from "../infrastructure/persistence/in-memory-ticket-repository";
import { ChangeTicketPriority } from "./change-ticket-priority";
import { CreateTicket } from "./create-ticket";

describe("ChangeTicketPriority", () => {
  it("changes the priority of an active ticket", async () => {
    const tickets = new InMemoryTicketRepository();
    const createTicket = new CreateTicket(
      tickets,
      new FixedIdGenerator("ticket-1"),
    );

    await createTicket.execute({
      title: "Printer unavailable",
      description: "Printer does not respond",
      priority: TicketPriority.MEDIUM,
      createdById: "user-1",
    });

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
