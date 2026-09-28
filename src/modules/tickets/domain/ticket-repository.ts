import { Ticket } from "./ticket";

export interface TicketRepository {
  findById(id: string): Promise<Ticket | null>;

  save(ticket: Ticket): Promise<void>;
}
