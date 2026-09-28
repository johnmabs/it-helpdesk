import { prisma } from "@/shared/database/prisma";

import { Ticket } from "../../domain/ticket";
import { TicketRepository } from "../../domain/ticket-repository";
import { TicketMapper } from "./ticket-mapper";

export class PrismaTicketRepository implements TicketRepository {
  async findById(id: string): Promise<Ticket | null> {
    const raw = await prisma.ticket.findUnique({
      where: { id },
    });

    return raw ? TicketMapper.toDomain(raw) : null;
  }

  async save(ticket: Ticket): Promise<void> {
    await prisma.ticket.upsert({
      where: {
        id: ticket.id,
      },
      create: {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        createdById: ticket.createdById,
        assignedToId: ticket.assignedToId,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        resolvedAt: ticket.resolvedAt,
        closedAt: ticket.closedAt,
      },
      update: {
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        assignedToId: ticket.assignedToId,
        updatedAt: ticket.updatedAt,
        resolvedAt: ticket.resolvedAt,
        closedAt: ticket.closedAt,
      },
    });
  }
}
