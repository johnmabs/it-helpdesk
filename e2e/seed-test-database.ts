import { PrismaPg } from "@prisma/adapter-pg";
import argon2 from "argon2";

import { PrismaClient } from "../src/generated/prisma/client";
import {
  TicketPriority,
  TicketStatus,
  UserRole,
} from "../src/generated/prisma/enums";

import {
  E2E_ADMIN_TICKET_ID,
  E2E_CATEGORY,
  E2E_PASSWORD,
  E2E_USERS,
} from "./fixtures";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for E2E setup");
}

if (!new URL(databaseUrl).pathname.toLowerCase().includes("test")) {
  throw new Error("E2E setup refuses to clean a non-test database");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function seedTestDatabase(): Promise<void> {
  await prisma.ticketHistory.deleteMany();
  await prisma.ticketComment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await argon2.hash(E2E_PASSWORD);
  const createdAt = new Date("2026-09-30T08:00:00.000Z");

  await prisma.user.createMany({
    data: [
      {
        ...E2E_USERS.admin,
        passwordHash,
        role: UserRole.ADMIN,
        createdAt,
      },
      {
        ...E2E_USERS.technician,
        passwordHash,
        role: UserRole.TECHNICIAN,
        createdAt,
      },
      {
        ...E2E_USERS.requester,
        passwordHash,
        role: UserRole.USER,
        createdAt,
      },
    ],
  });
  await prisma.category.create({
    data: {
      ...E2E_CATEGORY,
      description: "Category reserved for end-to-end tests",
      createdAt,
    },
  });
  await prisma.ticket.create({
    data: {
      id: E2E_ADMIN_TICKET_ID,
      title: "Administrator-only ticket",
      description: "Used to verify ticket visibility boundaries.",
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      createdById: E2E_USERS.admin.id,
      categoryId: E2E_CATEGORY.id,
      createdAt,
      updatedAt: createdAt,
    },
  });
}

seedTestDatabase()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
