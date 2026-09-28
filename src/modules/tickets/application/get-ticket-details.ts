import { prisma } from "@/shared/database/prisma";

export type TicketDetails = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  closedAt: Date | null;

  createdBy: {
    id: string;
    name: string;
    email: string;
  };

  assignedTo: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export async function getTicketDetails(
  id: string,
): Promise<TicketDetails | null> {
  return prisma.ticket.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      createdAt: true,
      updatedAt: true,
      resolvedAt: true,
      closedAt: true,

      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}
