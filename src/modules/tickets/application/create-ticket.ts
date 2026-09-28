import { IdGenerator } from "@/shared/identity/id-generator";

import { Ticket } from "../domain/ticket";
import { TicketPriority } from "../domain/ticket-priority";
import { TicketRepository } from "../domain/ticket-repository";

export type CreateTicketInput = {
  title: string;
  description: string;
  priority: TicketPriority;
  createdById: string;
};

export type CreateTicketOutput = {
  id: string;
  status: string;
};

export class CreateTicket {
  constructor(
    private readonly tickets: TicketRepository,
    private readonly idGenerator: IdGenerator,
  ) {}

  async execute(input: CreateTicketInput): Promise<CreateTicketOutput> {
    const now = new Date();

    const ticket = Ticket.create({
      id: this.idGenerator.generate(),
      title: input.title,
      description: input.description,
      priority: input.priority,
      createdById: input.createdById,
      createdAt: now,
    });

    await this.tickets.save(ticket);

    return {
      id: ticket.id,
      status: ticket.status,
    };
  }
}
