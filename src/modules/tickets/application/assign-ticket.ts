import { TicketRepository } from "../domain/ticket-repository";

export type AssignTicketInput = {
  ticketId: string;
  technicianId: string;
};

export class AssignTicket {
  constructor(private readonly tickets: TicketRepository) {}

  async execute(input: AssignTicketInput): Promise<void> {
    const ticket = await this.tickets.findById(input.ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    ticket.assignTo(input.technicianId, new Date());

    await this.tickets.save(ticket);
  }
}
