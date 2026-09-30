import { TicketComment } from "./ticket-comment";

export interface TicketCommentRepository {
  findById(id: string): Promise<TicketComment | null>;
  save(comment: TicketComment): Promise<void>;
}
