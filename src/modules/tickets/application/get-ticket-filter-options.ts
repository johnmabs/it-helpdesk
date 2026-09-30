import { TicketViewer } from "@/modules/auth/domain/permissions";
import { UserRole } from "@/modules/users/domain/user-role";
import { prisma } from "@/shared/database/prisma";

export type TicketFilterOption = {
  id: string;
  name: string;
};

export type TicketFilterOptions = {
  categories: TicketFilterOption[];
  technicians: TicketFilterOption[];
  creators: TicketFilterOption[];
};

export async function getTicketFilterOptions(
  viewer: TicketViewer,
): Promise<TicketFilterOptions> {
  const [categories, technicians, creators] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: {
        role: {
          in: [UserRole.TECHNICIAN, UserRole.ADMIN],
        },
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: viewer.role === UserRole.USER ? { id: viewer.id } : {},
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return { categories, technicians, creators };
}
