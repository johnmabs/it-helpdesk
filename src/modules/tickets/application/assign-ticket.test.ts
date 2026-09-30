import { beforeEach, describe, expect, it } from "vitest";

import { User } from "@/modules/users/domain/user";
import { UserRole } from "@/modules/users/domain/user-role";
import { InMemoryUserRepository } from "@/modules/users/infrastructure/persistence/in-memory-user-repository";
import { FixedIdGenerator } from "@/shared/identity/fixed-id-generator";

import { Ticket } from "../domain/ticket";
import { TicketHistoryAction } from "../domain/ticket-history-action";
import { TicketPriority } from "../domain/ticket-priority";
import { TicketStatus } from "../domain/ticket-status";
import { InMemoryTicketHistoryRepository } from "../infrastructure/persistence/in-memory-ticket-history-repository";
import { InMemoryTicketRepository } from "../infrastructure/persistence/in-memory-ticket-repository";
import { AssignTicket } from "./assign-ticket";
import { TicketHistoryRecorder } from "./ticket-history-recorder";

describe("AssignTicket", () => {
  let tickets: InMemoryTicketRepository;
  let users: InMemoryUserRepository;
  let history: InMemoryTicketHistoryRepository;
  let assignTicket: AssignTicket;

  beforeEach(async () => {
    tickets = new InMemoryTicketRepository();
    users = new InMemoryUserRepository();
    history = new InMemoryTicketHistoryRepository();
    assignTicket = new AssignTicket(
      tickets,
      users,
      new TicketHistoryRecorder(
        history,
        new FixedIdGenerator("history-1"),
      ),
    );

    await tickets.save(
      Ticket.create({
        id: "ticket-1",
        title: "Printer unavailable",
        description: "The office printer cannot be reached",
        priority: TicketPriority.MEDIUM,
        createdById: "requester-1",
        categoryId: "category-1",
        createdAt: new Date("2026-09-28T08:00:00Z"),
      }),
    );
  });

  it.each([UserRole.TECHNICIAN, UserRole.ADMIN])(
    "assigns a ticket to an active %s",
    async (role) => {
      await addUser({ role, active: true });

      await assignTicket.execute({
        ticketId: "ticket-1",
        technicianId: "assignee-1",
        actorId: "dispatcher-1",
      });

      const ticket = await tickets.findById("ticket-1");

      expect(ticket?.assignedToId).toBe("assignee-1");
      expect(ticket?.status).toBe(TicketStatus.ASSIGNED);
      await expect(history.findByTicketId("ticket-1")).resolves.toMatchObject([
        {
          actorId: "dispatcher-1",
          action: TicketHistoryAction.ASSIGNED,
          oldValue: null,
          newValue: "assignee-1",
        },
      ]);
    },
  );

  it("rejects an unknown assignee", async () => {
    await expect(
      assignTicket.execute({
        ticketId: "ticket-1",
        technicianId: "unknown-user",
        actorId: "dispatcher-1",
      }),
    ).rejects.toThrow("Technician not found");

    await expectTicketToRemainOpen();
  });

  it("rejects an inactive assignee", async () => {
    await addUser({ role: UserRole.TECHNICIAN, active: false });

    await expect(
      assignTicket.execute({
        ticketId: "ticket-1",
        technicianId: "assignee-1",
        actorId: "dispatcher-1",
      }),
    ).rejects.toThrow("Inactive user cannot receive tickets");

    await expectTicketToRemainOpen();
  });

  it("rejects an assignee without the technician or admin role", async () => {
    await addUser({ role: UserRole.USER, active: true });

    await expect(
      assignTicket.execute({
        ticketId: "ticket-1",
        technicianId: "assignee-1",
        actorId: "dispatcher-1",
      }),
    ).rejects.toThrow("Ticket can only be assigned to a technician");

    await expectTicketToRemainOpen();
  });

  async function addUser({
    role,
    active,
  }: {
    role: UserRole;
    active: boolean;
  }): Promise<void> {
    await users.create({
      user: User.create({
        id: "assignee-1",
        email: "assignee@example.com",
        name: "Assignee",
        role,
        active,
        createdAt: new Date("2026-09-28T08:00:00Z"),
      }),
      passwordHash: "unused-password-hash",
    });
  }

  async function expectTicketToRemainOpen(): Promise<void> {
    const ticket = await tickets.findById("ticket-1");

    expect(ticket?.assignedToId).toBeNull();
    expect(ticket?.status).toBe(TicketStatus.OPEN);
    await expect(history.findByTicketId("ticket-1")).resolves.toEqual([]);
  }
});
