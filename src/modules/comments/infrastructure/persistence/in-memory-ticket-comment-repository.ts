import { TicketCommentRepository } from "../../domain/ticket-comment-repository";
import { TicketComment } from "../../domain/ticket-comment";

export class InMemoryTicketCommentRepository
  implements TicketCommentRepository
{
  private readonly comments = new Map<string, TicketComment>();

  async findById(id: string): Promise<TicketComment | null> {
    return this.comments.get(id) ?? null;
  }

  async save(comment: TicketComment): Promise<void> {
    this.comments.set(comment.id, comment);
  }
}
