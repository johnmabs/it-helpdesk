import { TicketPriority } from "../domain/ticket-priority";
import { TicketRepository } from "../domain/ticket-repository";

export type ChangeTicketPriorityInput = {
  ticketId: string;
  priority: TicketPriority;
};

export class ChangeTicketPriority {
  constructor(private readonly tickets: TicketRepository) {}

  async execute(input: ChangeTicketPriorityInput): Promise<void> {
    const ticket = await this.tickets.findById(input.ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    ticket.changePriority(input.priority, new Date());

    await this.tickets.save(ticket);
  }
}
