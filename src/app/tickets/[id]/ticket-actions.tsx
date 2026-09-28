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
  assignableUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
  }>;
};

export function TicketActions({
  ticketId,
  status,
  role,
  assignableUsers,
}: TicketActionsProps) {
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

          <label htmlFor="technicianId">Technicien</label>

          <select
            id="technicianId"
            name="technicianId"
            defaultValue=""
            required
          >
            <option value="" disabled>
              Sélectionner un utilisateur
            </option>

            {assignableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email}) · {user.role}
              </option>
            ))}
          </select>

          <button type="submit" disabled={assignableUsers.length === 0}>
            Assigner
          </button>
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
