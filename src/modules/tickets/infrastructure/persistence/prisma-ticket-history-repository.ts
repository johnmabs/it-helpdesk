import { prisma } from "@/shared/database/prisma";

import { TicketHistoryRepository } from "../../domain/ticket-history-repository";
import { TicketHistory } from "../../domain/ticket-history";
import { TicketHistoryMapper } from "./ticket-history-mapper";

export class PrismaTicketHistoryRepository
  implements TicketHistoryRepository
{
  async findByTicketId(ticketId: string): Promise<TicketHistory[]> {
    const entries = await prisma.ticketHistory.findMany({
      where: { ticketId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    return entries.map((entry) => TicketHistoryMapper.toDomain(entry));
  }

  async save(entry: TicketHistory): Promise<void> {
    await prisma.ticketHistory.create({
      data: {
        id: entry.id,
        ticketId: entry.ticketId,
        actorId: entry.actorId,
        action: entry.action,
        oldValue: entry.oldValue,
        newValue: entry.newValue,
        createdAt: entry.createdAt,
      },
    });
  }
}
