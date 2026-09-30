import { TicketViewer } from "@/modules/auth/domain/permissions";
import { UserRole } from "@/modules/users/domain/user-role";
import { prisma } from "@/shared/database/prisma";

export type RecentTicketListItem = {
  id: string;
  title: string;
  status: string;
  priority: string;
  updatedAt: Date;
  categoryName: string | null;
  assignedToName: string | null;
};

export async function listRecentTickets(
  viewer: TicketViewer,
  limit = 5,
): Promise<RecentTicketListItem[]> {
  const tickets = await prisma.ticket.findMany({
    where:
      viewer.role === UserRole.USER ? { createdById: viewer.id } : {},
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      updatedAt: true,
      category: {
        select: {
          name: true,
        },
      },
      assignedTo: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: limit,
  });

  return tickets.map((ticket) => ({
    id: ticket.id,
    title: ticket.title,
    status: ticket.status,
    priority: ticket.priority,
    updatedAt: ticket.updatedAt,
    categoryName: ticket.category?.name ?? null,
    assignedToName: ticket.assignedTo?.name ?? null,
  }));
}
