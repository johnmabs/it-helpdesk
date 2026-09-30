import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { Category } from "@/modules/categories/domain/category";
import { PrismaCategoryRepository } from "@/modules/categories/infrastructure/persistence/prisma-category-repository";
import { TicketComment } from "@/modules/comments/domain/ticket-comment";
import { PrismaTicketCommentRepository } from "@/modules/comments/infrastructure/persistence/prisma-ticket-comment-repository";
import { Ticket } from "@/modules/tickets/domain/ticket";
import { TicketHistory } from "@/modules/tickets/domain/ticket-history";
import { TicketHistoryAction } from "@/modules/tickets/domain/ticket-history-action";
import { TicketPriority } from "@/modules/tickets/domain/ticket-priority";
import { TicketStatus } from "@/modules/tickets/domain/ticket-status";
import { PrismaTicketHistoryRepository } from "@/modules/tickets/infrastructure/persistence/prisma-ticket-history-repository";
import { PrismaTicketRepository } from "@/modules/tickets/infrastructure/persistence/prisma-ticket-repository";
import { User } from "@/modules/users/domain/user";
import { UserRole } from "@/modules/users/domain/user-role";
import { PrismaUserRepository } from "@/modules/users/infrastructure/persistence/prisma-user-repository";
import { prisma } from "@/shared/database/prisma";

const users = new PrismaUserRepository();
const categories = new PrismaCategoryRepository();
const tickets = new PrismaTicketRepository();
const comments = new PrismaTicketCommentRepository();
const history = new PrismaTicketHistoryRepository();

const createdAt = new Date("2026-09-30T08:00:00.000Z");

beforeAll(async () => {
  await prisma.$connect();
  await cleanDatabase();
});

afterEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

async function cleanDatabase(): Promise<void> {
  await prisma.ticketHistory.deleteMany();
  await prisma.ticketComment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
}

describe("PrismaUserRepository", () => {
  it("persists, retrieves and updates a user and their session state", async () => {
    const user = makeUser("user-1", UserRole.USER);

    await users.create({ user, passwordHash: "hashed-password" });

    await expect(
      users.findByEmail(" USER-1@EXAMPLE.COM "),
    ).resolves.toMatchObject({
      id: "user-1",
      email: "user-1@example.com",
      role: UserRole.USER,
      active: true,
    });
    await expect(
      users.findForAuthentication("user-1@example.com"),
    ).resolves.toMatchObject({
      id: "user-1",
      passwordHash: "hashed-password",
      sessionVersion: 0,
    });

    user.changeRole(UserRole.TECHNICIAN);
    user.deactivate();
    await users.save(user);
    await users.revokeSessions(user.id);

    await expect(users.findById(user.id)).resolves.toMatchObject({
      role: UserRole.TECHNICIAN,
      active: false,
    });
    await expect(users.findSessionState(user.id)).resolves.toEqual({
      active: false,
      sessionVersion: 1,
    });
  });
});

describe("PrismaCategoryRepository", () => {
  it("upserts categories and filters inactive categories", async () => {
    const hardware = makeCategory("category-hardware", "Hardware");
    const software = makeCategory("category-software", "Software");

    await categories.save(hardware);
    await categories.save(software);

    software.updateDetails("Applications", "Business software");
    software.deactivate();
    await categories.save(software);

    await expect(categories.findByName(" hardware ")).resolves.toMatchObject({
      id: hardware.id,
      name: "Hardware",
      active: true,
    });
    await expect(categories.findById(software.id)).resolves.toMatchObject({
      name: "Applications",
      description: "Business software",
      active: false,
    });
    await expect(
      categories.findAll({ activeOnly: true }),
    ).resolves.toMatchObject([{ id: hardware.id, name: "Hardware" }]);
  });
});

describe("PrismaTicketRepository", () => {
  it("persists and updates the complete ticket state", async () => {
    const { category, creator } = await seedTicketRelations();
    const technician = makeUser("technician-1", UserRole.TECHNICIAN);
    await users.create({ user: technician, passwordHash: "hash" });
    const ticket = makeTicket(creator.id, category.id);

    await tickets.save(ticket);

    await expect(tickets.findById(ticket.id)).resolves.toMatchObject({
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      assignedToId: null,
      categoryId: category.id,
    });

    ticket.assignTo(technician.id, new Date("2026-09-30T09:00:00.000Z"));
    ticket.changePriority(
      TicketPriority.CRITICAL,
      new Date("2026-09-30T09:05:00.000Z"),
    );
    await tickets.save(ticket);

    await expect(tickets.findById(ticket.id)).resolves.toMatchObject({
      status: TicketStatus.ASSIGNED,
      priority: TicketPriority.CRITICAL,
      assignedToId: technician.id,
    });
  });
});

describe("PrismaTicketCommentRepository", () => {
  it("persists and updates a comment", async () => {
    const { creator, ticket } = await seedTicket();
    const comment = TicketComment.create({
      id: "comment-1",
      ticketId: ticket.id,
      authorId: creator.id,
      body: "Initial diagnostic",
      createdAt,
    });

    await comments.save(comment);
    const updatedAt = new Date("2026-09-30T10:00:00.000Z");
    comment.updateBody("Updated diagnostic", updatedAt);
    await comments.save(comment);

    await expect(comments.findById(comment.id)).resolves.toMatchObject({
      ticketId: ticket.id,
      authorId: creator.id,
      body: "Updated diagnostic",
      createdAt,
      updatedAt,
    });
  });
});

describe("PrismaTicketHistoryRepository", () => {
  it("returns audit entries in chronological order", async () => {
    const { creator, ticket } = await seedTicket();
    const laterEntry = TicketHistory.create({
      id: "history-2",
      ticketId: ticket.id,
      actorId: creator.id,
      action: TicketHistoryAction.PRIORITY_CHANGED,
      oldValue: TicketPriority.MEDIUM,
      newValue: TicketPriority.HIGH,
      createdAt: new Date("2026-09-30T09:00:00.000Z"),
    });
    const earlierEntry = TicketHistory.create({
      id: "history-1",
      ticketId: ticket.id,
      actorId: creator.id,
      action: TicketHistoryAction.TICKET_CREATED,
      createdAt,
    });

    await history.save(laterEntry);
    await history.save(earlierEntry);

    const entries = await history.findByTicketId(ticket.id);

    expect(entries.map((entry) => entry.id)).toEqual([
      earlierEntry.id,
      laterEntry.id,
    ]);
    expect(entries[1]).toMatchObject({
      action: TicketHistoryAction.PRIORITY_CHANGED,
      oldValue: TicketPriority.MEDIUM,
      newValue: TicketPriority.HIGH,
    });
  });
});

function makeUser(id: string, role: UserRole): User {
  return User.create({
    id,
    name: `User ${id}`,
    email: `${id}@example.com`,
    role,
    active: true,
    createdAt,
  });
}

function makeCategory(id: string, name: string): Category {
  return Category.create({
    id,
    name,
    description: `${name} issues`,
    createdAt,
  });
}

function makeTicket(createdById: string, categoryId: string): Ticket {
  return Ticket.create({
    id: "ticket-1",
    title: "Integration test ticket",
    description: "Repository persistence verification",
    priority: TicketPriority.MEDIUM,
    createdById,
    categoryId,
    createdAt,
  });
}

async function seedTicketRelations(): Promise<{
  creator: User;
  category: Category;
}> {
  const creator = makeUser("requester-1", UserRole.USER);
  const category = makeCategory("category-1", "Hardware");

  await users.create({ user: creator, passwordHash: "hash" });
  await categories.save(category);

  return { creator, category };
}

async function seedTicket(): Promise<{
  creator: User;
  category: Category;
  ticket: Ticket;
}> {
  const { creator, category } = await seedTicketRelations();
  const ticket = makeTicket(creator.id, category.id);
  await tickets.save(ticket);

  return { creator, category, ticket };
}
