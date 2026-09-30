import { beforeEach, describe, expect, it } from "vitest";

import { Ticket } from "@/modules/tickets/domain/ticket";
import { TicketPriority } from "@/modules/tickets/domain/ticket-priority";
import { InMemoryTicketRepository } from "@/modules/tickets/infrastructure/persistence/in-memory-ticket-repository";
import { UserRole } from "@/modules/users/domain/user-role";
import { FixedIdGenerator } from "@/shared/identity/fixed-id-generator";

import { InMemoryTicketCommentRepository } from "../infrastructure/persistence/in-memory-ticket-comment-repository";
import { AddTicketComment } from "./add-ticket-comment";

describe("AddTicketComment", () => {
  let tickets: InMemoryTicketRepository;
  let comments: InMemoryTicketCommentRepository;
  let addTicketComment: AddTicketComment;

  beforeEach(async () => {
    tickets = new InMemoryTicketRepository();
    comments = new InMemoryTicketCommentRepository();
    addTicketComment = new AddTicketComment(
      tickets,
      comments,
      new FixedIdGenerator("comment-1"),
    );

    await tickets.save(
      Ticket.create({
        id: "ticket-1",
        title: "Printer unavailable",
        description: "The office printer cannot be reached",
        priority: TicketPriority.MEDIUM,
        createdById: "requester-1",
        categoryId: "category-1",
        createdAt: new Date("2026-09-30T08:00:00Z"),
      }),
    );
  });

  it.each([
    ["the requester", "requester-1", UserRole.USER],
    ["a technician", "technician-1", UserRole.TECHNICIAN],
    ["an administrator", "admin-1", UserRole.ADMIN],
  ])("allows %s to add a comment", async (_, userId, role) => {
    const result = await addTicketComment.execute({
      ticketId: "ticket-1",
      body: "  The replacement part has been ordered.  ",
      authenticatedUser: { id: userId, role },
    });

    expect(result).toMatchObject({
      id: "comment-1",
      ticketId: "ticket-1",
      authorId: userId,
      body: "The replacement part has been ordered.",
    });
    expect(result.createdAt).toBeInstanceOf(Date);
    await expect(comments.findById("comment-1")).resolves.toMatchObject({
      id: "comment-1",
      authorId: userId,
      body: "The replacement part has been ordered.",
    });
  });

  it("rejects an unauthenticated user", async () => {
    await expect(
      addTicketComment.execute({
        ticketId: "ticket-1",
        body: "A comment",
        authenticatedUser: null,
      }),
    ).rejects.toThrow("Authentication required");

    await expect(comments.findById("comment-1")).resolves.toBeNull();
  });

  it("rejects an empty comment", async () => {
    await expect(
      addTicketComment.execute({
        ticketId: "ticket-1",
        body: "   ",
        authenticatedUser: {
          id: "requester-1",
          role: UserRole.USER,
        },
      }),
    ).rejects.toThrow("Comment body is required");

    await expect(comments.findById("comment-1")).resolves.toBeNull();
  });

  it("rejects a user who cannot view the ticket", async () => {
    await expect(
      addTicketComment.execute({
        ticketId: "ticket-1",
        body: "A comment",
        authenticatedUser: {
          id: "another-requester",
          role: UserRole.USER,
        },
      }),
    ).rejects.toThrow("Not allowed to view this ticket");

    await expect(comments.findById("comment-1")).resolves.toBeNull();
  });

  it("rejects an unknown ticket", async () => {
    await expect(
      addTicketComment.execute({
        ticketId: "unknown-ticket",
        body: "A comment",
        authenticatedUser: {
          id: "requester-1",
          role: UserRole.USER,
        },
      }),
    ).rejects.toThrow("Ticket not found");

    await expect(comments.findById("comment-1")).resolves.toBeNull();
  });
});
