import {
  canViewTicket,
  TicketViewer,
} from "@/modules/auth/domain/permissions";
import { TicketRepository } from "@/modules/tickets/domain/ticket-repository";
import { TicketHistoryAction } from "@/modules/tickets/domain/ticket-history-action";
import { TicketHistoryRecorder } from "@/modules/tickets/application/ticket-history-recorder";
import { IdGenerator } from "@/shared/identity/id-generator";

import { TicketCommentRepository } from "../domain/ticket-comment-repository";
import { TicketComment } from "../domain/ticket-comment";

export type AddTicketCommentInput = {
  ticketId: string;
  body: string;
  authenticatedUser: TicketViewer | null;
};

export type AddTicketCommentOutput = {
  id: string;
  ticketId: string;
  authorId: string;
  body: string;
  createdAt: Date;
};

export class AddTicketComment {
  constructor(
    private readonly tickets: TicketRepository,
    private readonly comments: TicketCommentRepository,
    private readonly idGenerator: IdGenerator,
    private readonly history: TicketHistoryRecorder,
  ) {}

  async execute(
    input: AddTicketCommentInput,
  ): Promise<AddTicketCommentOutput> {
    if (!input.authenticatedUser) {
      throw new Error("Authentication required");
    }

    const ticket = await this.tickets.findById(input.ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    if (!canViewTicket(input.authenticatedUser, ticket)) {
      throw new Error("Not allowed to view this ticket");
    }

    const comment = TicketComment.create({
      id: this.idGenerator.generate(),
      ticketId: ticket.id,
      authorId: input.authenticatedUser.id,
      body: input.body,
      createdAt: new Date(),
    });

    await this.comments.save(comment);
    await this.history.record({
      ticketId: comment.ticketId,
      actorId: comment.authorId,
      action: TicketHistoryAction.COMMENT_ADDED,
      newValue: comment.body,
      createdAt: comment.createdAt,
    });

    return {
      id: comment.id,
      ticketId: comment.ticketId,
      authorId: comment.authorId,
      body: comment.body,
      createdAt: comment.createdAt,
    };
  }
}
