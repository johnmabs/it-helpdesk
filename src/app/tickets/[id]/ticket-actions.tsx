import { UserRole } from "@/modules/users/domain/user-role";

import {
  assignTicketAction,
  closeTicketAction,
  resolveTicketAction,
  startTicketAction,
} from "./actions";

type TicketActionsProps = {
  ticketId: string;
  status: string;
  role: UserRole;
};

export function TicketActions({ ticketId, status, role }: TicketActionsProps) {
  const canManage = role === UserRole.ADMIN || role === UserRole.TECHNICIAN;

  if (!canManage) {
    return null;
  }

  return (
    <section>
      <h2>Actions</h2>

      {status === "OPEN" ? (
        <form action={assignTicketAction}>
          <input type="hidden" name="ticketId" value={ticketId} />

          <input
            type="text"
            name="technicianId"
            placeholder="ID technicien"
            required
          />

          <button type="submit">Assigner</button>
        </form>
      ) : null}

      {status === "ASSIGNED" ? (
        <form action={startTicketAction}>
          <input type="hidden" name="ticketId" value={ticketId} />

          <button type="submit">Commencer</button>
        </form>
      ) : null}

      {status === "IN_PROGRESS" ? (
        <form action={resolveTicketAction}>
          <input type="hidden" name="ticketId" value={ticketId} />

          <button type="submit">Résoudre</button>
        </form>
      ) : null}

      {status === "RESOLVED" ? (
        <form action={closeTicketAction}>
          <input type="hidden" name="ticketId" value={ticketId} />

          <button type="submit">Clôturer</button>
        </form>
      ) : null}
    </section>
  );
}
