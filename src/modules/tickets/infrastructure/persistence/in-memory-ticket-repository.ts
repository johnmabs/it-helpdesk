import { Ticket } from "../../domain/ticket";
import { TicketRepository } from "../../domain/ticket-repository";

export class InMemoryTicketRepository implements TicketRepository {
  private readonly tickets = new Map<string, Ticket>();

  async findById(id: string): Promise<Ticket | null> {
    return this.tickets.get(id) ?? null;
  }

  async save(ticket: Ticket): Promise<void> {
    this.tickets.set(ticket.id, ticket);
  }
}
