import { CategoryRepository } from "@/modules/categories/domain/category-repository";
import { IdGenerator } from "@/shared/identity/id-generator";

import { Ticket } from "../domain/ticket";
import { TicketPriority } from "../domain/ticket-priority";
import { TicketRepository } from "../domain/ticket-repository";

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
  ) {}

  async execute(input: CreateTicketInput): Promise<CreateTicketOutput> {
    const category = await this.categories.findById(input.categoryId);

    if (!category) {
      throw new Error("Category not found");
    }

    if (!category.active) {
      throw new Error("Category is inactive");
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

    return {
      id: ticket.id,
      status: ticket.status,
      categoryId: category.id,
    };
  }
}
