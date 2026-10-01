"use client";

import { useActionState, useEffect, useRef } from "react";

import { FormFeedback } from "@/app/ui/form-feedback";
import { FormField } from "@/app/ui/form-field";
import { SubmitButton } from "@/app/ui/submit-button";

import { addTicketCommentAction } from "./actions";

const initialState = {
  error: "",
  submitted: false,
};

export function AddTicketCommentForm({ ticketId }: { ticketId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState(
    addTicketCommentAction,
    initialState,
  );

  useEffect(() => {
    if (state.submitted) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} className="form-stack" action={action}>
      <input type="hidden" name="ticketId" value={ticketId} />

      <FormField id="comment-body" label="Ajouter un commentaire" required>
        <textarea
          id="comment-body"
          name="body"
          rows={4}
          required
          aria-describedby={state.error ? "comment-form-feedback" : undefined}
          aria-invalid={Boolean(state.error)}
        />
      </FormField>

      <FormFeedback
        id="comment-form-feedback"
        error={state.error}
        message={state.submitted ? "Commentaire ajouté." : ""}
      />

      <div className="form-actions">
        <SubmitButton pendingLabel="Publication...">
          Publier le commentaire
        </SubmitButton>
      </div>
    </form>
  );
}
