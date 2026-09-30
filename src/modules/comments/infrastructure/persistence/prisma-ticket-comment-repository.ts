import { prisma } from "@/shared/database/prisma";

import { TicketCommentRepository } from "../../domain/ticket-comment-repository";
import { TicketComment } from "../../domain/ticket-comment";
import { TicketCommentMapper } from "./ticket-comment-mapper";

export class PrismaTicketCommentRepository
  implements TicketCommentRepository
{
  async findById(id: string): Promise<TicketComment | null> {
    const raw = await prisma.ticketComment.findUnique({
      where: { id },
    });

    return raw ? TicketCommentMapper.toDomain(raw) : null;
  }

  async save(comment: TicketComment): Promise<void> {
    await prisma.ticketComment.upsert({
      where: { id: comment.id },
      create: {
        id: comment.id,
        ticketId: comment.ticketId,
        authorId: comment.authorId,
        body: comment.body,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      },
      update: {
        body: comment.body,
        updatedAt: comment.updatedAt,
      },
    });
  }
}
