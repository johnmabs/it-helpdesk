import { describe, expect, it } from "vitest";

import { FixedIdGenerator } from "@/shared/identity/fixed-id-generator";

import { TicketPriority } from "../domain/ticket-priority";
import { TicketStatus } from "../domain/ticket-status";
import { InMemoryTicketRepository } from "../infrastructure/persistence/in-memory-ticket-repository";
import { CloseTicket } from "./close-ticket";
import { CreateTicket } from "./create-ticket";
import { ResolveTicket } from "./resolve-ticket";
import { StartTicket } from "./start-ticket";

describe("CloseTicket", () => {
  it("closes a resolved ticket", async () => {
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

    const ticket = await tickets.findById("ticket-1");
    ticket!.assignTo("tech-1", new Date());
    await tickets.save(ticket!);
    await new StartTicket(tickets).execute("ticket-1");
    await new ResolveTicket(tickets).execute("ticket-1");

    await new CloseTicket(tickets).execute("ticket-1");

    const closedTicket = await tickets.findById("ticket-1");

    expect(closedTicket?.status).toBe(TicketStatus.CLOSED);
    expect(closedTicket?.closedAt).toBeInstanceOf(Date);
  });

  it("rejects an unknown ticket", async () => {
    const closeTicket = new CloseTicket(new InMemoryTicketRepository());

    await expect(closeTicket.execute("unknown-ticket")).rejects.toThrow(
      "Ticket not found",
    );
  });
});
