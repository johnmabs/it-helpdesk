import { describe, expect, it } from "vitest";

import { TicketPriority } from "@/modules/tickets/domain/ticket-priority";

import {
  addTicketCommentRequestSchema,
  changeTicketPriorityRequestSchema,
  createCategoryRequestSchema,
  createTicketRequestSchema,
  loginRequestSchema,
} from "./request-schemas";

describe("web request schemas", () => {
  it("normalizes valid login credentials", () => {
    expect(
      loginRequestSchema.parse({
        email: "  USER@EXAMPLE.COM ",
        password: " password ",
      }),
    ).toEqual({
      email: "user@example.com",
      password: " password ",
    });
  });

  it("rejects malformed login credentials", () => {
    expect(
      loginRequestSchema.safeParse({ email: "invalid", password: "" })
        .success,
    ).toBe(false);
  });

  it("validates and normalizes ticket creation", () => {
    expect(
      createTicketRequestSchema.parse({
        title: "  Printer offline ",
        description: "  The printer does not respond. ",
        priority: "HIGH",
        categoryId: " category-1 ",
      }),
    ).toEqual({
      title: "Printer offline",
      description: "The printer does not respond.",
      priority: TicketPriority.HIGH,
      categoryId: "category-1",
    });

    expect(
      createTicketRequestSchema.safeParse({
        title: "Printer offline",
        description: "The printer does not respond.",
        priority: "URGENT",
        categoryId: "category-1",
      }).success,
    ).toBe(false);
  });

  it("normalizes an optional category description", () => {
    expect(
      createCategoryRequestSchema.parse({
        name: "  Hardware ",
        description: "   ",
      }),
    ).toEqual({ name: "Hardware", description: null });
  });

  it("rejects an empty comment", () => {
    expect(
      addTicketCommentRequestSchema.safeParse({
        ticketId: "ticket-1",
        body: "   ",
      }).success,
    ).toBe(false);
  });

  it("accepts only known priorities for a priority change", () => {
    expect(
      changeTicketPriorityRequestSchema.parse({
        ticketId: " ticket-1 ",
        priority: "CRITICAL",
      }),
    ).toEqual({
      ticketId: "ticket-1",
      priority: TicketPriority.CRITICAL,
    });

    expect(
      changeTicketPriorityRequestSchema.safeParse({
        ticketId: "ticket-1",
        priority: "URGENT",
      }).success,
    ).toBe(false);
  });
});
