import { TicketNotFoundError } from "@/shared/errors/application-error";

import { TicketHistoryAction } from "../domain/ticket-history-action";
import { TicketRepository } from "../domain/ticket-repository";
import { TicketHistoryRecorder } from "./ticket-history-recorder";

export type ResolveTicketInput = {
  ticketId: string;
  actorId: string;
};

export class ResolveTicket {
  constructor(
    private readonly tickets: TicketRepository,
    private readonly history: TicketHistoryRecorder,
  ) {}

  async execute(input: ResolveTicketInput): Promise<void> {
    const ticket = await this.tickets.findById(input.ticketId);

    if (!ticket) {
      throw new TicketNotFoundError();
    }

    const now = new Date();
    const previousStatus = ticket.status;

    ticket.resolve(now);

    await this.tickets.save(ticket);
    await this.history.record({
      ticketId: ticket.id,
      actorId: input.actorId,
      action: TicketHistoryAction.STATUS_CHANGED,
      oldValue: previousStatus,
      newValue: ticket.status,
      createdAt: now,
    });
  }
}
