"use client";

import { useActionState } from "react";

import { loginAction } from "./actions";

const initialState = {
  error: "",
};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action}>
      <div>
        <label htmlFor="email">Email</label>

        <input id="email" name="email" type="email" required />
      </div>

      <div>
        <label htmlFor="password">Mot de passe</label>

        <input id="password" name="password" type="password" required />
      </div>

      {state.error ? <p role="alert">{state.error}</p> : null}

      <button type="submit" disabled={pending}>
        {pending ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
