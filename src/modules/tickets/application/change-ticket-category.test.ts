import { describe, expect, it } from "vitest";

import { Category } from "@/modules/categories/domain/category";
import { InMemoryCategoryRepository } from "@/modules/categories/infrastructure/persistence/in-memory-category-repository";
import { FixedIdGenerator } from "@/shared/identity/fixed-id-generator";

import { Ticket } from "../domain/ticket";
import { TicketHistoryAction } from "../domain/ticket-history-action";
import { TicketPriority } from "../domain/ticket-priority";
import { InMemoryTicketHistoryRepository } from "../infrastructure/persistence/in-memory-ticket-history-repository";
import { InMemoryTicketRepository } from "../infrastructure/persistence/in-memory-ticket-repository";
import { ChangeTicketCategory } from "./change-ticket-category";
import { TicketHistoryRecorder } from "./ticket-history-recorder";

describe("ChangeTicketCategory", () => {
  it("changes the category and records the previous and new categories", async () => {
    const tickets = new InMemoryTicketRepository();
    const categories = new InMemoryCategoryRepository();
    const history = new InMemoryTicketHistoryRepository();
    await tickets.save(makeTicket());
    await categories.save(
      Category.create({
        id: "category-2",
        name: "Network",
        createdAt: new Date("2026-09-30T08:00:00Z"),
      }),
    );

    await new ChangeTicketCategory(
      tickets,
      categories,
      new TicketHistoryRecorder(
        history,
        new FixedIdGenerator("history-1"),
      ),
    ).execute({
      ticketId: "ticket-1",
      categoryId: "category-2",
      actorId: "admin-1",
    });

    expect((await tickets.findById("ticket-1"))?.categoryId).toBe(
      "category-2",
    );
    await expect(history.findByTicketId("ticket-1")).resolves.toMatchObject([
      {
        actorId: "admin-1",
        action: TicketHistoryAction.CATEGORY_CHANGED,
        oldValue: "category-1",
        newValue: "category-2",
      },
    ]);
  });

  it("does not record a rejected category change", async () => {
    const tickets = new InMemoryTicketRepository();
    const history = new InMemoryTicketHistoryRepository();
    await tickets.save(makeTicket());

    const useCase = new ChangeTicketCategory(
      tickets,
      new InMemoryCategoryRepository(),
      new TicketHistoryRecorder(
        history,
        new FixedIdGenerator("history-1"),
      ),
    );

    await expect(
      useCase.execute({
        ticketId: "ticket-1",
        categoryId: "unknown-category",
        actorId: "admin-1",
      }),
    ).rejects.toThrow("Category not found");
    await expect(history.findByTicketId("ticket-1")).resolves.toEqual([]);
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
