"use client";

import { useActionState } from "react";

import { FormFeedback } from "@/app/ui/form-feedback";
import { FormField } from "@/app/ui/form-field";
import { SubmitButton } from "@/app/ui/submit-button";
import type { CategoryOutput } from "@/modules/categories/application/category-output";

import {
  type CategoryActionState,
  createCategoryAction,
  deactivateCategoryAction,
  updateCategoryAction,
} from "./actions";

const initialState: CategoryActionState = {
  error: "",
  message: "",
};

export function CreateCategoryForm() {
  const [state, action] = useActionState(
    createCategoryAction,
    initialState,
  );

  return (
    <form className="form-stack" action={action}>
      <FormField id="new-category-name" label="Nom" required>
        <input
          id="new-category-name"
          name="name"
          required
          aria-describedby={state.error ? "create-category-feedback" : undefined}
          aria-invalid={Boolean(state.error)}
        />
      </FormField>

      <FormField id="new-category-description" label="Description">
        <textarea id="new-category-description" name="description" rows={3} />
      </FormField>

      <FormFeedback
        id="create-category-feedback"
        error={state.error}
        message={state.message}
      />

      <div className="form-actions">
        <SubmitButton pendingLabel="Création...">
          Créer la catégorie
        </SubmitButton>
      </div>
    </form>
  );
}

export function UpdateCategoryForm({ category }: { category: CategoryOutput }) {
  const [state, action] = useActionState(
    updateCategoryAction,
    initialState,
  );

  return (
    <form className="form-stack" action={action}>
      <input type="hidden" name="categoryId" value={category.id} />

      <FormField id={`category-name-${category.id}`} label="Nom" required>
        <input
          id={`category-name-${category.id}`}
          name="name"
          defaultValue={category.name}
          required
          aria-describedby={
            state.error ? `category-feedback-${category.id}` : undefined
          }
          aria-invalid={Boolean(state.error)}
        />
      </FormField>

      <FormField
        id={`category-description-${category.id}`}
        label="Description"
      >
        <textarea
          id={`category-description-${category.id}`}
          name="description"
          defaultValue={category.description ?? ""}
          rows={2}
        />
      </FormField>

      <FormFeedback
        id={`category-feedback-${category.id}`}
        error={state.error}
        message={state.message}
      />

      <div className="form-actions">
        <SubmitButton pendingLabel="Enregistrement...">
          Enregistrer
        </SubmitButton>
      </div>
    </form>
  );
}

export function DeactivateCategoryForm({
  category,
}: {
  category: CategoryOutput;
}) {
  const [state, action] = useActionState(
    deactivateCategoryAction,
    initialState,
  );

  return (
    <div>
      <FormFeedback
        id={`deactivate-category-feedback-${category.id}`}
        error={state.error}
        message={state.message}
      />

      {category.active ? (
        <form action={action}>
          <input type="hidden" name="categoryId" value={category.id} />
          <SubmitButton pendingLabel="Désactivation..." variant="danger">
            Désactiver
          </SubmitButton>
        </form>
      ) : (
        <p>Catégorie inactive</p>
      )}
    </div>
  );
}
