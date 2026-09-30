import { TicketViewer } from "@/modules/auth/domain/permissions";
import { UserRole } from "@/modules/users/domain/user-role";
import { prisma } from "@/shared/database/prisma";

import { TicketPriority } from "../domain/ticket-priority";
import { TicketStatus } from "../domain/ticket-status";

export type TicketSummaryMetrics = {
  open: number;
  assigned: number;
  inProgress: number;
  critical: number;
  resolvedToday: number;
};

export async function getTicketSummaryMetrics(
  viewer: TicketViewer,
  now = new Date(),
): Promise<TicketSummaryMetrics> {
  const visibilityFilter =
    viewer.role === UserRole.USER ? { createdById: viewer.id } : {};
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const [open, assigned, inProgress, critical, resolvedToday] =
    await prisma.$transaction([
      prisma.ticket.count({
        where: {
          ...visibilityFilter,
          status: TicketStatus.OPEN,
        },
      }),
      prisma.ticket.count({
        where: {
          ...visibilityFilter,
          status: TicketStatus.ASSIGNED,
        },
      }),
      prisma.ticket.count({
        where: {
          ...visibilityFilter,
          status: TicketStatus.IN_PROGRESS,
        },
      }),
      prisma.ticket.count({
        where: {
          ...visibilityFilter,
          priority: TicketPriority.CRITICAL,
        },
      }),
      prisma.ticket.count({
        where: {
          ...visibilityFilter,
          resolvedAt: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
        },
      }),
    ]);

  return {
    open,
    assigned,
    inProgress,
    critical,
    resolvedToday,
  };
}
