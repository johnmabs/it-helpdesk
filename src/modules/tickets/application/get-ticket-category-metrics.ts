import { TicketViewer } from "@/modules/auth/domain/permissions";
import { UserRole } from "@/modules/users/domain/user-role";
import { prisma } from "@/shared/database/prisma";

export type TicketCategoryMetric = {
  id: string;
  name: string;
  ticketCount: number;
};

export async function getTicketCategoryMetrics(
  viewer: TicketViewer,
): Promise<TicketCategoryMetric[]> {
  const visibilityFilter =
    viewer.role === UserRole.USER ? { createdById: viewer.id } : {};

  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          tickets: {
            where: visibilityFilter,
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    ticketCount: category._count.tickets,
  }));
}
