"use client";

import { useActionState } from "react";

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
        <label htmlFor="categoryId">Catégorie</label>

        <select
          id="categoryId"
          name="categoryId"
          defaultValue=""
          required
          disabled={categories.length === 0}
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
      </div>

      {categories.length === 0 ? (
        <p role="alert">
          Aucune catégorie active. Contactez un administrateur avant de créer
          un ticket.
        </p>
      ) : null}

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

      <button type="submit" disabled={pending || categories.length === 0}>
        {pending ? "Création..." : "Créer le ticket"}
      </button>
    </form>
  );
}
