import { TicketHistoryAction } from "../domain/ticket-history-action";
import { TicketPriority } from "../domain/ticket-priority";
import { TicketRepository } from "../domain/ticket-repository";
import { TicketHistoryRecorder } from "./ticket-history-recorder";

export type ChangeTicketPriorityInput = {
  ticketId: string;
  priority: TicketPriority;
  actorId: string;
};

export class ChangeTicketPriority {
  constructor(
    private readonly tickets: TicketRepository,
    private readonly history: TicketHistoryRecorder,
  ) {}

  async execute(input: ChangeTicketPriorityInput): Promise<void> {
    const ticket = await this.tickets.findById(input.ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const now = new Date();
    const previousPriority = ticket.priority;

    ticket.changePriority(input.priority, now);

    await this.tickets.save(ticket);
    await this.history.record({
      ticketId: ticket.id,
      actorId: input.actorId,
      action: TicketHistoryAction.PRIORITY_CHANGED,
      oldValue: previousPriority,
      newValue: ticket.priority,
      createdAt: now,
    });
  }
}
