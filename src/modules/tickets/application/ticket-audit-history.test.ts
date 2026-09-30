import { describe, expect, it } from "vitest";

import { Category } from "@/modules/categories/domain/category";
import { InMemoryCategoryRepository } from "@/modules/categories/infrastructure/persistence/in-memory-category-repository";
import { AddTicketComment } from "@/modules/comments/application/add-ticket-comment";
import { InMemoryTicketCommentRepository } from "@/modules/comments/infrastructure/persistence/in-memory-ticket-comment-repository";
import { User } from "@/modules/users/domain/user";
import { UserRole } from "@/modules/users/domain/user-role";
import { InMemoryUserRepository } from "@/modules/users/infrastructure/persistence/in-memory-user-repository";
import { FixedIdGenerator } from "@/shared/identity/fixed-id-generator";
import { IdGenerator } from "@/shared/identity/id-generator";

import { Ticket } from "../domain/ticket";
import { TicketHistoryAction } from "../domain/ticket-history-action";
import { TicketHistory } from "../domain/ticket-history";
import { TicketPriority } from "../domain/ticket-priority";
import { TicketStatus } from "../domain/ticket-status";
import { InMemoryTicketHistoryRepository } from "../infrastructure/persistence/in-memory-ticket-history-repository";
import { InMemoryTicketRepository } from "../infrastructure/persistence/in-memory-ticket-repository";
import { AssignTicket } from "./assign-ticket";
import { CancelTicket } from "./cancel-ticket";
import { ChangeTicketCategory } from "./change-ticket-category";
import { ChangeTicketPriority } from "./change-ticket-priority";
import { CloseTicket } from "./close-ticket";
import { CreateTicket } from "./create-ticket";
import { ResolveTicket } from "./resolve-ticket";
import { StartTicket } from "./start-ticket";
import { TicketHistoryRecorder } from "./ticket-history-recorder";

describe("ticket audit history", () => {
  it("records exactly the expected entry for every important action", async () => {
    const tickets = new InMemoryTicketRepository();
    const categories = new InMemoryCategoryRepository();
    const users = new InMemoryUserRepository();
    const comments = new InMemoryTicketCommentRepository();
    const history = new InMemoryTicketHistoryRepository();
    const recorder = new TicketHistoryRecorder(
      history,
      new SequenceIdGenerator("history"),
    );

    await categories.save(makeCategory("category-1", "Hardware"));
    await categories.save(makeCategory("category-2", "Network"));
    await users.create({
      user: User.create({
        id: "technician-1",
        email: "technician@example.com",
        name: "Marc",
        role: UserRole.TECHNICIAN,
        active: true,
        createdAt: new Date("2026-09-30T08:00:00Z"),
      }),
      passwordHash: "unused-password-hash",
    });

    await new CreateTicket(
      tickets,
      new FixedIdGenerator("ticket-1"),
      categories,
      recorder,
    ).execute({
      title: "Printer unavailable",
      description: "The office printer cannot be reached",
      priority: TicketPriority.MEDIUM,
      createdById: "requester-1",
      categoryId: "category-1",
    });

    await new ChangeTicketPriority(tickets, recorder).execute({
      ticketId: "ticket-1",
      priority: TicketPriority.HIGH,
      actorId: "admin-1",
    });
    await new ChangeTicketCategory(tickets, categories, recorder).execute({
      ticketId: "ticket-1",
      categoryId: "category-2",
      actorId: "admin-1",
    });
    await new AssignTicket(tickets, users, recorder).execute({
      ticketId: "ticket-1",
      technicianId: "technician-1",
      actorId: "admin-1",
    });
    await new StartTicket(tickets, recorder).execute({
      ticketId: "ticket-1",
      actorId: "technician-1",
    });
    await new AddTicketComment(
      tickets,
      comments,
      new FixedIdGenerator("comment-1"),
      recorder,
    ).execute({
      ticketId: "ticket-1",
      body: "The replacement part has been ordered.",
      authenticatedUser: {
        id: "requester-1",
        role: UserRole.USER,
      },
    });
    await new ResolveTicket(tickets, recorder).execute({
      ticketId: "ticket-1",
      actorId: "technician-1",
    });
    await new CloseTicket(tickets, recorder).execute({
      ticketId: "ticket-1",
      actorId: "admin-1",
    });

    const entries = await history.findByTicketId("ticket-1");

    expect(entries).toHaveLength(8);
    expect(entries.map(toComparableHistoryEntry)).toEqual([
      expectedEntry(
        "history-01",
        "requester-1",
        TicketHistoryAction.TICKET_CREATED,
        null,
        null,
      ),
      expectedEntry(
        "history-02",
        "admin-1",
        TicketHistoryAction.PRIORITY_CHANGED,
        TicketPriority.MEDIUM,
        TicketPriority.HIGH,
      ),
      expectedEntry(
        "history-03",
        "admin-1",
        TicketHistoryAction.CATEGORY_CHANGED,
        "category-1",
        "category-2",
      ),
      expectedEntry(
        "history-04",
        "admin-1",
        TicketHistoryAction.ASSIGNED,
        null,
        "technician-1",
      ),
      expectedEntry(
        "history-05",
        "technician-1",
        TicketHistoryAction.STATUS_CHANGED,
        TicketStatus.ASSIGNED,
        TicketStatus.IN_PROGRESS,
      ),
      expectedEntry(
        "history-06",
        "requester-1",
        TicketHistoryAction.COMMENT_ADDED,
        null,
        "The replacement part has been ordered.",
      ),
      expectedEntry(
        "history-07",
        "technician-1",
        TicketHistoryAction.STATUS_CHANGED,
        TicketStatus.IN_PROGRESS,
        TicketStatus.RESOLVED,
      ),
      expectedEntry(
        "history-08",
        "admin-1",
        TicketHistoryAction.STATUS_CHANGED,
        TicketStatus.RESOLVED,
        TicketStatus.CLOSED,
      ),
    ]);
  });

  it("records exactly one status entry when a ticket is cancelled", async () => {
    const tickets = new InMemoryTicketRepository();
    const history = new InMemoryTicketHistoryRepository();
    await tickets.save(makeTicket());

    await new CancelTicket(
      tickets,
      new TicketHistoryRecorder(
        history,
        new FixedIdGenerator("history-cancel"),
      ),
    ).execute({
      ticketId: "ticket-1",
      actorId: "admin-1",
    });

    const entries = await history.findByTicketId("ticket-1");

    expect(entries).toHaveLength(1);
    expect(entries.map(toComparableHistoryEntry)).toEqual([
      expectedEntry(
        "history-cancel",
        "admin-1",
        TicketHistoryAction.STATUS_CHANGED,
        TicketStatus.OPEN,
        TicketStatus.CANCELLED,
      ),
    ]);
  });

  it("returns history entries in chronological order", async () => {
    const history = new InMemoryTicketHistoryRepository();

    await history.save(
      makeHistoryEntry("history-3", "2026-09-30T10:00:00Z"),
    );
    await history.save(
      makeHistoryEntry("history-1", "2026-09-30T09:00:00Z"),
    );
    await history.save(
      makeHistoryEntry("history-2", "2026-09-30T10:00:00Z"),
    );
    await history.save(
      makeHistoryEntry(
        "another-ticket-history",
        "2026-09-30T08:00:00Z",
        "ticket-2",
      ),
    );

    const entries = await history.findByTicketId("ticket-1");

    expect(entries.map((entry) => entry.id)).toEqual([
      "history-1",
      "history-2",
      "history-3",
    ]);
  });
});

class SequenceIdGenerator implements IdGenerator {
  private current = 0;

  constructor(private readonly prefix: string) {}

  generate(): string {
    this.current += 1;

    return `${this.prefix}-${String(this.current).padStart(2, "0")}`;
  }
}

function makeCategory(id: string, name: string): Category {
  return Category.create({
    id,
    name,
    createdAt: new Date("2026-09-30T08:00:00Z"),
  });
}

function makeTicket(): Ticket {
  return Ticket.create({
    id: "ticket-1",
    title: "Printer unavailable",
    description: "The office printer cannot be reached",
    priority: TicketPriority.MEDIUM,
    createdById: "requester-1",
    categoryId: "category-1",
    createdAt: new Date("2026-09-30T08:00:00Z"),
  });
}

function makeHistoryEntry(
  id: string,
  createdAt: string,
  ticketId = "ticket-1",
): TicketHistory {
  return TicketHistory.create({
    id,
    ticketId,
    actorId: "admin-1",
    action: TicketHistoryAction.STATUS_CHANGED,
    oldValue: TicketStatus.OPEN,
    newValue: TicketStatus.CANCELLED,
    createdAt: new Date(createdAt),
  });
}

function toComparableHistoryEntry(entry: TicketHistory) {
  return {
    id: entry.id,
    ticketId: entry.ticketId,
    actorId: entry.actorId,
    action: entry.action,
    oldValue: entry.oldValue,
    newValue: entry.newValue,
    createdAt: entry.createdAt,
  };
}

function expectedEntry(
  id: string,
  actorId: string,
  action: TicketHistoryAction,
  oldValue: string | null,
  newValue: string | null,
) {
  return {
    id,
    ticketId: "ticket-1",
    actorId,
    action,
    oldValue,
    newValue,
    createdAt: expect.any(Date),
  };
}
