import { TicketComment as PrismaTicketComment } from "@/generated/prisma/client";

import { TicketComment } from "../../domain/ticket-comment";

export class TicketCommentMapper {
  static toDomain(raw: PrismaTicketComment): TicketComment {
    return TicketComment.restore({
      id: raw.id,
      ticketId: raw.ticketId,
      authorId: raw.authorId,
      body: raw.body,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
