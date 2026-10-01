import { FormField } from "@/app/ui/form-field";
import { SubmitButton } from "@/app/ui/submit-button";
import { TicketPriority } from "@/modules/tickets/domain/ticket-priority";
import { UserRole } from "@/modules/users/domain/user-role";

import {
  assignTicketAction,
  changeTicketPriorityAction,
  closeTicketAction,
  resolveTicketAction,
  startTicketAction,
} from "./actions";

type TicketActionsProps = {
  ticketId: string;
  status: string;
  priority: string;
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
  priority,
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

      {status !== "CLOSED" && status !== "CANCELLED" ? (
        <form className="form-inline" action={changeTicketPriorityAction}>
          <input type="hidden" name="ticketId" value={ticketId} />

          <FormField id="ticket-priority" label="Priorité">
            <select
              id="ticket-priority"
              name="priority"
              defaultValue={priority}
            >
              {Object.values(TicketPriority).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </FormField>

          <SubmitButton pendingLabel="Modification..." variant="secondary">
            Modifier la priorité
          </SubmitButton>
        </form>
      ) : null}

      {status === "OPEN" ? (
        <form className="form-inline" action={assignTicketAction}>
          <input type="hidden" name="ticketId" value={ticketId} />

          <FormField id="technicianId" label="Technicien" required>
            <select
              id="technicianId"
              name="technicianId"
              defaultValue=""
              required
              disabled={assignableUsers.length === 0}
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
          </FormField>

          <SubmitButton
            pendingLabel="Assignation..."
            disabled={assignableUsers.length === 0}
          >
            Assigner
          </SubmitButton>
        </form>
      ) : null}

      {status === "ASSIGNED" ? (
        <form className="form-inline" action={startTicketAction}>
          <input type="hidden" name="ticketId" value={ticketId} />

          <SubmitButton pendingLabel="Démarrage...">Commencer</SubmitButton>
        </form>
      ) : null}

      {status === "IN_PROGRESS" ? (
        <form className="form-inline" action={resolveTicketAction}>
          <input type="hidden" name="ticketId" value={ticketId} />

          <SubmitButton pendingLabel="Résolution...">Résoudre</SubmitButton>
        </form>
      ) : null}

      {status === "RESOLVED" ? (
        <form className="form-inline" action={closeTicketAction}>
          <input type="hidden" name="ticketId" value={ticketId} />

          <SubmitButton pendingLabel="Clôture...">Clôturer</SubmitButton>
        </form>
      ) : null}
    </section>
  );
}
