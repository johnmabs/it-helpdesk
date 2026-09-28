import { UserRepository } from "@/modules/users/domain/user-repository";
import { UserRole } from "@/modules/users/domain/user-role";

import { TicketRepository } from "../domain/ticket-repository";

export type AssignTicketInput = {
  ticketId: string;
  technicianId: string;
};

export class AssignTicket {
  constructor(
    private readonly tickets: TicketRepository,
    private readonly users: UserRepository,
  ) {}

  async execute(input: AssignTicketInput): Promise<void> {
    const ticket = await this.tickets.findById(input.ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const technician = await this.users.findById(input.technicianId);

    if (!technician) {
      throw new Error("User not found");
    }

    if (!technician.active) {
      throw new Error("User is inactive");
    }

    if (
      technician.role !== UserRole.TECHNICIAN &&
      technician.role !== UserRole.ADMIN
    ) {
      throw new Error("User is not assignable");
    }

    ticket.assignTo(input.technicianId, new Date());

    await this.tickets.save(ticket);
  }
}
