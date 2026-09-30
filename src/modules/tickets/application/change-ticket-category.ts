import { CategoryRepository } from "@/modules/categories/domain/category-repository";

import { TicketHistoryAction } from "../domain/ticket-history-action";
import { TicketRepository } from "../domain/ticket-repository";
import { TicketHistoryRecorder } from "./ticket-history-recorder";

export type ChangeTicketCategoryInput = {
  ticketId: string;
  categoryId: string;
  actorId: string;
};

export class ChangeTicketCategory {
  constructor(
    private readonly tickets: TicketRepository,
    private readonly categories: CategoryRepository,
    private readonly history: TicketHistoryRecorder,
  ) {}

  async execute(input: ChangeTicketCategoryInput): Promise<void> {
    const ticket = await this.tickets.findById(input.ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const category = await this.categories.findById(input.categoryId);

    if (!category) {
      throw new Error("Category not found");
    }

    if (!category.active) {
      throw new Error("Category is inactive");
    }

    const now = new Date();
    const previousCategoryId = ticket.categoryId;

    ticket.changeCategory(category.id, now);

    await this.tickets.save(ticket);
    await this.history.record({
      ticketId: ticket.id,
      actorId: input.actorId,
      action: TicketHistoryAction.CATEGORY_CHANGED,
      oldValue: previousCategoryId,
      newValue: ticket.categoryId,
      createdAt: now,
    });
  }
}
