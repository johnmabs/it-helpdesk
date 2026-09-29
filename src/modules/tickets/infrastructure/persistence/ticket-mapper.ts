import {
  Ticket as PrismaTicket,
  TicketPriority as PrismaTicketPriority,
  TicketStatus as PrismaTicketStatus,
} from "@/generated/prisma/client";

import { Ticket } from "../../domain/ticket";
import { TicketPriority } from "../../domain/ticket-priority";
import { TicketStatus } from "../../domain/ticket-status";

export class TicketMapper {
  static toDomain(raw: PrismaTicket): Ticket {
    return Ticket.restore({
      id: raw.id,
      title: raw.title,
      description: raw.description,
      status: this.toDomainStatus(raw.status),
      priority: this.toDomainPriority(raw.priority),
      createdById: raw.createdById,
      assignedToId: raw.assignedToId,
      categoryId: raw.categoryId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      resolvedAt: raw.resolvedAt,
      closedAt: raw.closedAt,
    });
  }

  private static toDomainStatus(status: PrismaTicketStatus): TicketStatus {
    return TicketStatus[status];
  }

  private static toDomainPriority(
    priority: PrismaTicketPriority,
  ): TicketPriority {
    return TicketPriority[priority];
  }
}
