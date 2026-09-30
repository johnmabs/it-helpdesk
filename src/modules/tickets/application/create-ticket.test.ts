import { beforeEach, describe, expect, it } from "vitest";

import { Category } from "@/modules/categories/domain/category";
import { InMemoryCategoryRepository } from "@/modules/categories/infrastructure/persistence/in-memory-category-repository";
import { FixedIdGenerator } from "@/shared/identity/fixed-id-generator";

import { TicketPriority } from "../domain/ticket-priority";
import { TicketHistoryAction } from "../domain/ticket-history-action";
import { InMemoryTicketHistoryRepository } from "../infrastructure/persistence/in-memory-ticket-history-repository";
import { InMemoryTicketRepository } from "../infrastructure/persistence/in-memory-ticket-repository";
import { CreateTicket } from "./create-ticket";
import { TicketHistoryRecorder } from "./ticket-history-recorder";

describe("CreateTicket", () => {
  let tickets: InMemoryTicketRepository;
  let categories: InMemoryCategoryRepository;
  let history: InMemoryTicketHistoryRepository;
  let createTicket: CreateTicket;

  beforeEach(() => {
    tickets = new InMemoryTicketRepository();
    categories = new InMemoryCategoryRepository();
    history = new InMemoryTicketHistoryRepository();
    createTicket = new CreateTicket(
      tickets,
      new FixedIdGenerator("ticket-1"),
      categories,
      new TicketHistoryRecorder(
        history,
        new FixedIdGenerator("history-1"),
      ),
    );
  });

  it("creates a ticket in an active category", async () => {
    await categories.save(makeCategory());

    const result = await createTicket.execute(validInput());

    expect(result).toMatchObject({
      id: "ticket-1",
      status: "OPEN",
      categoryId: "category-1",
    });
    await expect(tickets.findById("ticket-1")).resolves.toMatchObject({
      categoryId: "category-1",
    });
    await expect(history.findByTicketId("ticket-1")).resolves.toMatchObject([
      {
        id: "history-1",
        actorId: "user-1",
        action: TicketHistoryAction.TICKET_CREATED,
        oldValue: null,
        newValue: null,
      },
    ]);
  });

  it("rejects an unknown category", async () => {
    await expect(createTicket.execute(validInput())).rejects.toThrow(
      "Category not found",
    );
    await expect(tickets.findById("ticket-1")).resolves.toBeNull();
    await expect(history.findByTicketId("ticket-1")).resolves.toEqual([]);
  });

  it("rejects an inactive category", async () => {
    const category = makeCategory();
    category.deactivate();
    await categories.save(category);

    await expect(createTicket.execute(validInput())).rejects.toThrow(
      "Category is inactive",
    );
    await expect(tickets.findById("ticket-1")).resolves.toBeNull();
    await expect(history.findByTicketId("ticket-1")).resolves.toEqual([]);
  });
});

function makeCategory(): Category {
  return Category.create({
    id: "category-1",
    name: "Hardware",
    createdAt: new Date("2026-09-29T08:00:00Z"),
  });
}

function validInput() {
  return {
    title: "Printer unavailable",
    description: "Printer does not respond",
    priority: TicketPriority.MEDIUM,
    createdById: "user-1",
    categoryId: "category-1",
  };
}
