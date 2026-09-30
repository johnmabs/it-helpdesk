import { CategoryRepository } from "@/modules/categories/domain/category-repository";
import {
  CategoryInactiveError,
  CategoryNotFoundError,
} from "@/shared/errors/application-error";
import { IdGenerator } from "@/shared/identity/id-generator";

import { Ticket } from "../domain/ticket";
import { TicketHistoryAction } from "../domain/ticket-history-action";
import { TicketPriority } from "../domain/ticket-priority";
import { TicketRepository } from "../domain/ticket-repository";
import { TicketHistoryRecorder } from "./ticket-history-recorder";

export type CreateTicketInput = {
  title: string;
  description: string;
  priority: TicketPriority;
  createdById: string;
  categoryId: string;
};

export type CreateTicketOutput = {
  id: string;
  status: string;
  categoryId: string;
};

export class CreateTicket {
  constructor(
    private readonly tickets: TicketRepository,
    private readonly idGenerator: IdGenerator,
    private readonly categories: CategoryRepository,
    private readonly history: TicketHistoryRecorder,
  ) {}

  async execute(input: CreateTicketInput): Promise<CreateTicketOutput> {
    const category = await this.categories.findById(input.categoryId);

    if (!category) {
      throw new CategoryNotFoundError();
    }

    if (!category.active) {
      throw new CategoryInactiveError();
    }

    const now = new Date();

    const ticket = Ticket.create({
      id: this.idGenerator.generate(),
      title: input.title,
      description: input.description,
      priority: input.priority,
      createdById: input.createdById,
      categoryId: category.id,
      createdAt: now,
    });

    await this.tickets.save(ticket);
    await this.history.record({
      ticketId: ticket.id,
      actorId: input.createdById,
      action: TicketHistoryAction.TICKET_CREATED,
      createdAt: now,
    });

    return {
      id: ticket.id,
      status: ticket.status,
      categoryId: category.id,
    };
  }
}
