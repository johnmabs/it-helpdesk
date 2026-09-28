"use client";

import { useActionState } from "react";

import { createTicketAction } from "./actions";

const initialState = {
  error: "",
};

export function CreateTicketForm() {
  const [state, action, pending] = useActionState(
    createTicketAction,
    initialState,
  );

  return (
    <form action={action}>
      <div>
        <label htmlFor="title">Titre</label>

        <input id="title" name="title" type="text" required />
      </div>

      <div>
        <label htmlFor="description">Description</label>

        <textarea id="description" name="description" required rows={6} />
      </div>

      <div>
        <label htmlFor="priority">Priorité</label>

        <select id="priority" name="priority" defaultValue="MEDIUM">
          <option value="LOW">Faible</option>

          <option value="MEDIUM">Moyenne</option>

          <option value="HIGH">Haute</option>

          <option value="CRITICAL">Critique</option>
        </select>
      </div>

      {state.error ? <p role="alert">{state.error}</p> : null}

      <button type="submit" disabled={pending}>
        {pending ? "Création..." : "Créer le ticket"}
      </button>
    </form>
  );
}
