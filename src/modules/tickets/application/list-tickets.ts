import { prisma } from "@/shared/database/prisma";

export type TicketListItem = {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: Date;
  createdByName: string;
  assignedToName: string | null;
  categoryName: string | null;
};

export async function listTickets(): Promise<TicketListItem[]> {
  const tickets = await prisma.ticket.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      createdBy: {
        select: {
          name: true,
        },
      },
      assignedTo: {
        select: {
          name: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  return tickets.map((ticket) => ({
    id: ticket.id,
    title: ticket.title,
    status: ticket.status,
    priority: ticket.priority,
    createdAt: ticket.createdAt,
    createdByName: ticket.createdBy.name,
    assignedToName: ticket.assignedTo?.name ?? null,
    categoryName: ticket.category?.name ?? null,
  }));
}
