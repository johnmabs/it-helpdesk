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

  category: {
    id: string;
    name: string;
  } | null;

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

  comments: Array<{
    id: string;
    body: string;
    createdAt: Date;
    updatedAt: Date | null;
    author: {
      id: string;
      name: string;
    };
  }>;
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

      category: {
        select: {
          id: true,
          name: true,
        },
      },

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

      comments: {
        select: {
          id: true,
          body: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      },
    },
  });
}
