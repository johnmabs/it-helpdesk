"use client";

import { useActionState } from "react";

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
  const [state, action, pending] = useActionState(
    createCategoryAction,
    initialState,
  );

  return (
    <form action={action}>
      <div>
        <label htmlFor="new-category-name">Nom</label>
        <input id="new-category-name" name="name" required />
      </div>

      <div>
        <label htmlFor="new-category-description">Description</label>
        <textarea id="new-category-description" name="description" rows={3} />
      </div>

      <ActionFeedback state={state} />

      <button type="submit" disabled={pending}>
        {pending ? "Création..." : "Créer la catégorie"}
      </button>
    </form>
  );
}

export function UpdateCategoryForm({ category }: { category: CategoryOutput }) {
  const [state, action, pending] = useActionState(
    updateCategoryAction,
    initialState,
  );

  return (
    <form action={action}>
      <input type="hidden" name="categoryId" value={category.id} />

      <div>
        <label htmlFor={`category-name-${category.id}`}>Nom</label>
        <input
          id={`category-name-${category.id}`}
          name="name"
          defaultValue={category.name}
          required
        />
      </div>

      <div>
        <label htmlFor={`category-description-${category.id}`}>
          Description
        </label>
        <textarea
          id={`category-description-${category.id}`}
          name="description"
          defaultValue={category.description ?? ""}
          rows={2}
        />
      </div>

      <ActionFeedback state={state} />

      <button type="submit" disabled={pending}>
        {pending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}

export function DeactivateCategoryForm({
  category,
}: {
  category: CategoryOutput;
}) {
  const [state, action, pending] = useActionState(
    deactivateCategoryAction,
    initialState,
  );

  return (
    <div>
      <ActionFeedback state={state} />

      {category.active ? (
        <form action={action}>
          <input type="hidden" name="categoryId" value={category.id} />
          <button type="submit" disabled={pending}>
            {pending ? "Désactivation..." : "Désactiver"}
          </button>
        </form>
      ) : (
        <p>Catégorie inactive</p>
      )}
    </div>
  );
}

function ActionFeedback({ state }: { state: CategoryActionState }) {
  if (state.error) {
    return <p role="alert">{state.error}</p>;
  }

  return state.message ? <p role="status">{state.message}</p> : null;
}
