"use client";

import { useActionState } from "react";

import { FormFeedback } from "@/app/ui/form-feedback";
import { FormField } from "@/app/ui/form-field";
import { SubmitButton } from "@/app/ui/submit-button";
import { TicketPriority } from "@/modules/tickets/domain/ticket-priority";
import { UserRole } from "@/modules/users/domain/user-role";

import { submitTicketAction } from "./actions";

const initialState = {
  error: "",
  message: "",
};

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
  const [state, action] = useActionState(submitTicketAction, initialState);

  if (!canManage) {
    return null;
  }

  return (
    <section>
      <h2>Actions</h2>

      <FormFeedback
        id="ticket-action-feedback"
        error={state.error}
        message={state.message}
      />

      {status !== "CLOSED" && status !== "CANCELLED" ? (
        <form className="form-inline" action={action}>
          <input type="hidden" name="ticketId" value={ticketId} />
          <input type="hidden" name="intent" value="changePriority" />

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
        <form className="form-inline" action={action}>
          <input type="hidden" name="ticketId" value={ticketId} />
          <input type="hidden" name="intent" value="assign" />

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
        <form className="form-inline" action={action}>
          <input type="hidden" name="ticketId" value={ticketId} />
          <input type="hidden" name="intent" value="start" />

          <SubmitButton pendingLabel="Démarrage...">Commencer</SubmitButton>
        </form>
      ) : null}

      {status === "IN_PROGRESS" ? (
        <form className="form-inline" action={action}>
          <input type="hidden" name="ticketId" value={ticketId} />
          <input type="hidden" name="intent" value="resolve" />

          <SubmitButton pendingLabel="Résolution...">Résoudre</SubmitButton>
        </form>
      ) : null}

      {status === "RESOLVED" ? (
        <form className="form-inline" action={action}>
          <input type="hidden" name="ticketId" value={ticketId} />
          <input type="hidden" name="intent" value="close" />

          <SubmitButton pendingLabel="Clôture...">Clôturer</SubmitButton>
        </form>
      ) : null}
    </section>
  );
}
