import { TicketRepository } from "../domain/ticket-repository";

export class CancelTicket {
  constructor(private readonly tickets: TicketRepository) {}

  async execute(ticketId: string): Promise<void> {
    const ticket = await this.tickets.findById(ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    ticket.cancel(new Date());

    await this.tickets.save(ticket);
  }
}
