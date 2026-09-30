import { TicketHistoryRepository } from "../../domain/ticket-history-repository";
import { TicketHistory } from "../../domain/ticket-history";

export class InMemoryTicketHistoryRepository
  implements TicketHistoryRepository
{
  private readonly entries = new Map<string, TicketHistory>();

  async findByTicketId(ticketId: string): Promise<TicketHistory[]> {
    return [...this.entries.values()]
      .filter((entry) => entry.ticketId === ticketId)
      .sort(
        (left, right) =>
          left.createdAt.getTime() - right.createdAt.getTime() ||
          left.id.localeCompare(right.id),
      );
  }

  async save(entry: TicketHistory): Promise<void> {
    this.entries.set(entry.id, entry);
  }
}
