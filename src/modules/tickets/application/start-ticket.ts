import { TicketRepository } from "../domain/ticket-repository";

export class StartTicket {
  constructor(private readonly tickets: TicketRepository) {}

  async execute(ticketId: string): Promise<void> {
    const ticket = await this.tickets.findById(ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    ticket.start(new Date());

    await this.tickets.save(ticket);
  }
}
