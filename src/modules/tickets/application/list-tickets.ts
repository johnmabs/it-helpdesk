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

export const TICKET_LIST_PAGE_SIZE = 20;

export type PaginatedTicketList = {
  items: TicketListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listTickets(
  viewer: TicketViewer,
  filters: TicketListFilters = {},
  requestedPage = 1,
): Promise<PaginatedTicketList> {
  const createdById =
    viewer.role === UserRole.USER ? viewer.id : filters.createdById;

  const where = {
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
  };
  const normalizedRequestedPage =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const total = await prisma.ticket.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / TICKET_LIST_PAGE_SIZE));
  const page = Math.min(normalizedRequestedPage, totalPages);

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * TICKET_LIST_PAGE_SIZE,
    take: TICKET_LIST_PAGE_SIZE,
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

  return {
    items: tickets.map((ticket) => ({
      id: ticket.id,
      title: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt,
      createdByName: ticket.createdBy.name,
      assignedToName: ticket.assignedTo?.name ?? null,
      categoryName: ticket.category?.name ?? null,
    })),
    total,
    page,
    pageSize: TICKET_LIST_PAGE_SIZE,
    totalPages,
  };
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

export function parseTicketListPage(
  value: string | string[] | undefined,
): number {
  const rawPage = readSingleValue(value);

  if (!rawPage) {
    return 1;
  }

  const page = Number(rawPage);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function readSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return value.trim() || undefined;
}
