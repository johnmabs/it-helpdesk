import { describe, expect, it } from "vitest";

import { TicketComment } from "./ticket-comment";

const createdAt = new Date("2026-09-30T07:00:00Z");

function makeComment(
  overrides: Partial<Parameters<typeof TicketComment.create>[0]> = {},
): TicketComment {
  return TicketComment.create({
    id: "comment-1",
    ticketId: "ticket-1",
    authorId: "user-1",
    body: "The replacement screen has been ordered.",
    createdAt,
    ...overrides,
  });
}

describe("TicketComment", () => {
  it("creates a ticket comment", () => {
    const comment = makeComment();

    expect(comment.id).toBe("comment-1");
    expect(comment.ticketId).toBe("ticket-1");
    expect(comment.authorId).toBe("user-1");
    expect(comment.body).toBe("The replacement screen has been ordered.");
    expect(comment.createdAt).toBe(createdAt);
    expect(comment.updatedAt).toBeNull();
  });

  it("trims the comment body", () => {
    const comment = makeComment({ body: "  Work in progress.  " });

    expect(comment.body).toBe("Work in progress.");
  });

  it("rejects an empty comment", () => {
    expect(() => makeComment({ body: "   " })).toThrow(
      "Comment body is required",
    );
  });

  it("updates the body and modification date", () => {
    const comment = makeComment();
    const updatedAt = new Date("2026-09-30T08:00:00Z");

    comment.updateBody("  The screen has arrived.  ", updatedAt);

    expect(comment.body).toBe("The screen has arrived.");
    expect(comment.updatedAt).toBe(updatedAt);
  });

  it("restores an existing comment", () => {
    const updatedAt = new Date("2026-09-30T08:00:00Z");
    const comment = TicketComment.restore({
      id: "comment-1",
      ticketId: "ticket-1",
      authorId: "user-1",
      body: "Stored body",
      createdAt,
      updatedAt,
    });

    expect(comment.body).toBe("Stored body");
    expect(comment.updatedAt).toBe(updatedAt);
  });
});
