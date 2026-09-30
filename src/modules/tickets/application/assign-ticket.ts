import { UserRepository } from "@/modules/users/domain/user-repository";
import { UserRole } from "@/modules/users/domain/user-role";

import { TicketHistoryAction } from "../domain/ticket-history-action";
import { TicketRepository } from "../domain/ticket-repository";
import { TicketHistoryRecorder } from "./ticket-history-recorder";

export type AssignTicketInput = {
  ticketId: string;
  technicianId: string;
  actorId: string;
};

export class AssignTicket {
  constructor(
    private readonly tickets: TicketRepository,
    private readonly users: UserRepository,
    private readonly history: TicketHistoryRecorder,
  ) {}

  async execute(input: AssignTicketInput): Promise<void> {
    const ticket = await this.tickets.findById(input.ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const technician = await this.users.findById(input.technicianId);

    if (!technician) {
      throw new Error("Technician not found");
    }

    if (!technician.active) {
      throw new Error("Inactive user cannot receive tickets");
    }

    if (
      technician.role !== UserRole.TECHNICIAN &&
      technician.role !== UserRole.ADMIN
    ) {
      throw new Error("Ticket can only be assigned to a technician");
    }

    const now = new Date();
    const previousAssigneeId = ticket.assignedToId;

    ticket.assignTo(input.technicianId, now);

    await this.tickets.save(ticket);
    await this.history.record({
      ticketId: ticket.id,
      actorId: input.actorId,
      action: TicketHistoryAction.ASSIGNED,
      oldValue: previousAssigneeId,
      newValue: ticket.assignedToId,
      createdAt: now,
    });
  }
}
