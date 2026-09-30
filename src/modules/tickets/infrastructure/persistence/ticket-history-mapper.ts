import {
  TicketHistory as PrismaTicketHistory,
  TicketHistoryAction as PrismaTicketHistoryAction,
} from "@/generated/prisma/client";

import { TicketHistoryAction } from "../../domain/ticket-history-action";
import { TicketHistory } from "../../domain/ticket-history";

export class TicketHistoryMapper {
  static toDomain(raw: PrismaTicketHistory): TicketHistory {
    return TicketHistory.restore({
      id: raw.id,
      ticketId: raw.ticketId,
      actorId: raw.actorId,
      action: this.toDomainAction(raw.action),
      oldValue: raw.oldValue,
      newValue: raw.newValue,
      createdAt: raw.createdAt,
    });
  }

  private static toDomainAction(
    action: PrismaTicketHistoryAction,
  ): TicketHistoryAction {
    return TicketHistoryAction[action];
  }
}
