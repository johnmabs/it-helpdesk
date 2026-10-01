"use client";

import { useActionState } from "react";

import { FormFeedback } from "@/app/ui/form-feedback";
import { FormField } from "@/app/ui/form-field";
import { SubmitButton } from "@/app/ui/submit-button";
import type { CategoryOutput } from "@/modules/categories/application/category-output";

import { createTicketAction } from "./actions";

const initialState = {
  error: "",
};

export function CreateTicketForm({
  categories,
}: {
  categories: CategoryOutput[];
}) {
  const [state, action] = useActionState(createTicketAction, initialState);
  const categoryErrorId =
    categories.length === 0
      ? "category-unavailable-error"
      : state.error
        ? "ticket-form-error"
        : undefined;

  return (
    <form className="form-stack" action={action}>
      <FormField id="title" label="Titre" required>
        <input
          id="title"
          name="title"
          type="text"
          required
          aria-describedby={state.error ? "ticket-form-error" : undefined}
          aria-invalid={Boolean(state.error)}
        />
      </FormField>

      <FormField id="description" label="Description" required>
        <textarea
          id="description"
          name="description"
          required
          rows={6}
          aria-describedby={state.error ? "ticket-form-error" : undefined}
          aria-invalid={Boolean(state.error)}
        />
      </FormField>

      <FormField id="categoryId" label="Catégorie" required>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue=""
          required
          disabled={categories.length === 0}
          aria-describedby={categoryErrorId}
          aria-invalid={categories.length === 0 || Boolean(state.error)}
        >
          <option value="" disabled>
            Sélectionner une catégorie
          </option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </FormField>

      {categories.length === 0 ? (
        <FormFeedback
          id="category-unavailable-error"
          error="Aucune catégorie active. Contactez un administrateur avant de créer un ticket."
        />
      ) : null}

      <FormField id="priority" label="Priorité">
        <select
          id="priority"
          name="priority"
          defaultValue="MEDIUM"
          aria-describedby={state.error ? "ticket-form-error" : undefined}
          aria-invalid={Boolean(state.error)}
        >
          <option value="LOW">Faible</option>

          <option value="MEDIUM">Moyenne</option>

          <option value="HIGH">Haute</option>

          <option value="CRITICAL">Critique</option>
        </select>
      </FormField>

      <FormFeedback id="ticket-form-error" error={state.error} />

      <div className="form-actions">
        <SubmitButton
          pendingLabel="Création..."
          disabled={categories.length === 0}
        >
          Créer le ticket
        </SubmitButton>
      </div>
    </form>
  );
}
