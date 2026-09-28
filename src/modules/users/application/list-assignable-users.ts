import { prisma } from "@/shared/database/prisma";

export async function listAssignableUsers() {
  return prisma.user.findMany({
    where: {
      active: true,
      role: {
        in: ["TECHNICIAN", "ADMIN"],
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}
