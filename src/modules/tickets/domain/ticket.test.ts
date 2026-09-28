import { describe, expect, it } from "vitest";

import { Ticket } from "./ticket";
import { TicketPriority } from "./ticket-priority";
import { TicketStatus } from "./ticket-status";

function makeTicket() {
  return Ticket.create({
    id: "ticket-1",
    title: "Internet unavailable",
    description: "No network access",
    priority: TicketPriority.HIGH,
    createdById: "user-1",
    createdAt: new Date("2026-01-01T08:00:00Z"),
  });
}

describe("Ticket", () => {
  it("creates an open ticket", () => {
    const ticket = makeTicket();

    expect(ticket.status).toBe(TicketStatus.OPEN);
    expect(ticket.assignedToId).toBeNull();
  });

  it("assigns an open ticket", () => {
    const ticket = makeTicket();

    ticket.assignTo("tech-1", new Date("2026-01-01T08:10:00Z"));

    expect(ticket.status).toBe(TicketStatus.ASSIGNED);

    expect(ticket.assignedToId).toBe("tech-1");
  });

  it("rejects starting an open ticket", () => {
    const ticket = makeTicket();

    expect(() => ticket.start(new Date())).toThrow(
      "Only assigned tickets can be started",
    );
  });

  it("follows the normal lifecycle", () => {
    const ticket = makeTicket();

    ticket.assignTo("tech-1", new Date());
    ticket.start(new Date());
    ticket.resolve(new Date());
    ticket.close(new Date());

    expect(ticket.status).toBe(TicketStatus.CLOSED);

    expect(ticket.resolvedAt).not.toBeNull();
    expect(ticket.closedAt).not.toBeNull();
  });

  it("cannot close an unresolved ticket", () => {
    const ticket = makeTicket();

    expect(() => ticket.close(new Date())).toThrow(
      "Only resolved tickets can be closed",
    );
  });

  it("cannot update priority after closure", () => {
    const ticket = makeTicket();

    ticket.assignTo("tech-1", new Date());
    ticket.start(new Date());
    ticket.resolve(new Date());
    ticket.close(new Date());

    expect(() =>
      ticket.changePriority(TicketPriority.CRITICAL, new Date()),
    ).toThrow("Closed or cancelled tickets cannot be updated");
  });
});
