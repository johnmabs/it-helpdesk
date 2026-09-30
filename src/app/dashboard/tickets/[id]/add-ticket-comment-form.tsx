"use client";

import { useActionState, useEffect, useRef } from "react";

import { addTicketCommentAction } from "./actions";

const initialState = {
  error: "",
  submitted: false,
};

export function AddTicketCommentForm({ ticketId }: { ticketId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    addTicketCommentAction,
    initialState,
  );

  useEffect(() => {
    if (state.submitted) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action}>
      <input type="hidden" name="ticketId" value={ticketId} />

      <label htmlFor="comment-body">Ajouter un commentaire</label>

      <textarea
        id="comment-body"
        name="body"
        rows={4}
        required
        disabled={pending}
      />

      {state.error ? <p role="alert">{state.error}</p> : null}

      <button type="submit" disabled={pending}>
        {pending ? "Publication..." : "Publier le commentaire"}
      </button>
    </form>
  );
}
