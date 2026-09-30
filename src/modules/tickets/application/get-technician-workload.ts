import { prisma } from "@/shared/database/prisma";

import { TicketStatus } from "../domain/ticket-status";

export type TechnicianWorkloadTicket = {
  id: string;
  title: string;
  priority: string;
  updatedAt: Date;
  resolvedAt: Date | null;
};

export type TechnicianWorkload = {
  assigned: TechnicianWorkloadTicket[];
  inProgress: TechnicianWorkloadTicket[];
  recentlyResolved: TechnicianWorkloadTicket[];
};

export async function getTechnicianWorkload(
  technicianId: string,
  limit = 5,
): Promise<TechnicianWorkload> {
  const selection = {
    id: true,
    title: true,
    priority: true,
    updatedAt: true,
    resolvedAt: true,
  } as const;

  const [assigned, inProgress, recentlyResolved] =
    await prisma.$transaction([
      prisma.ticket.findMany({
        where: {
          assignedToId: technicianId,
          status: TicketStatus.ASSIGNED,
        },
        select: selection,
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        take: limit,
      }),
      prisma.ticket.findMany({
        where: {
          assignedToId: technicianId,
          status: TicketStatus.IN_PROGRESS,
        },
        select: selection,
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        take: limit,
      }),
      prisma.ticket.findMany({
        where: {
          assignedToId: technicianId,
          status: {
            in: [TicketStatus.RESOLVED, TicketStatus.CLOSED],
          },
          resolvedAt: {
            not: null,
          },
        },
        select: selection,
        orderBy: [{ resolvedAt: "desc" }, { id: "desc" }],
        take: limit,
      }),
    ]);

  return {
    assigned,
    inProgress,
    recentlyResolved,
  };
}
