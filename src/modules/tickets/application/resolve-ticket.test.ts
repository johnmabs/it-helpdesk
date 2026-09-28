import { describe, expect, it } from "vitest";

import { FixedIdGenerator } from "@/shared/identity/fixed-id-generator";

import { TicketPriority } from "../domain/ticket-priority";
import { TicketStatus } from "../domain/ticket-status";
import { InMemoryTicketRepository } from "../infrastructure/persistence/in-memory-ticket-repository";
import { CreateTicket } from "./create-ticket";
import { ResolveTicket } from "./resolve-ticket";
import { StartTicket } from "./start-ticket";

describe("ResolveTicket", () => {
  it("resolves a ticket in progress", async () => {
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

    const resolvedTicket = await tickets.findById("ticket-1");

    expect(resolvedTicket?.status).toBe(TicketStatus.RESOLVED);
    expect(resolvedTicket?.resolvedAt).toBeInstanceOf(Date);
  });

  it("rejects an unknown ticket", async () => {
    const resolveTicket = new ResolveTicket(new InMemoryTicketRepository());

    await expect(resolveTicket.execute("unknown-ticket")).rejects.toThrow(
      "Ticket not found",
    );
  });
});
