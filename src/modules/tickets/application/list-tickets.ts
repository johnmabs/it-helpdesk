import { TicketViewer } from "@/modules/auth/domain/permissions";
import { UserRole } from "@/modules/users/domain/user-role";
import { prisma } from "@/shared/database/prisma";

import { TicketPriority } from "../domain/ticket-priority";
import { TicketStatus } from "../domain/ticket-status";

export type TicketListFilters = {
  status?: TicketStatus;
  priority?: TicketPriority;
  categoryId?: string;
  assignedToId?: string;
  createdById?: string;
};

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

export async function listTickets(
  viewer: TicketViewer,
  filters: TicketListFilters = {},
): Promise<TicketListItem[]> {
  const createdById =
    viewer.role === UserRole.USER ? viewer.id : filters.createdById;

  const tickets = await prisma.ticket.findMany({
    where: {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.assignedToId
        ? {
            assignedToId:
              filters.assignedToId === "unassigned"
                ? null
                : filters.assignedToId,
          }
        : {}),
      ...(createdById ? { createdById } : {}),
    },
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

export function parseTicketListFilters(
  searchParams: Record<string, string | string[] | undefined>,
): TicketListFilters {
  const status = readSingleValue(searchParams.status);
  const priority = readSingleValue(searchParams.priority);
  const categoryId = readSingleValue(searchParams.category);
  const assignedToId = readSingleValue(searchParams.assignee);
  const createdById = readSingleValue(searchParams.creator);

  return {
    ...(status && Object.values(TicketStatus).includes(status as TicketStatus)
      ? { status: status as TicketStatus }
      : {}),
    ...(priority &&
    Object.values(TicketPriority).includes(priority as TicketPriority)
      ? { priority: priority as TicketPriority }
      : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(assignedToId ? { assignedToId } : {}),
    ...(createdById ? { createdById } : {}),
  };
}

function readSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return value.trim() || undefined;
}
