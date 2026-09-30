import { TicketHistory } from "./ticket-history";

export interface TicketHistoryRepository {
  findByTicketId(ticketId: string): Promise<TicketHistory[]>;
  save(entry: TicketHistory): Promise<void>;
}
