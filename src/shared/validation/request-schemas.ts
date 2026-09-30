import { z } from "zod";

import { TicketPriority } from "@/modules/tickets/domain/ticket-priority";

const requiredString = z.string().trim().min(1);

export const loginRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const createTicketRequestSchema = z.object({
  title: requiredString,
  description: requiredString,
  priority: z.enum(TicketPriority),
  categoryId: requiredString,
});

export const createCategoryRequestSchema = z.object({
  name: requiredString,
  description: z
    .union([z.string().trim(), z.null()])
    .transform((value) => value || null),
});

export const addTicketCommentRequestSchema = z.object({
  ticketId: requiredString,
  body: requiredString,
});

export const changeTicketPriorityRequestSchema = z.object({
  ticketId: requiredString,
  priority: z.enum(TicketPriority),
});
