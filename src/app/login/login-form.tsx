"use client";

import { useActionState } from "react";

import { FormFeedback } from "@/app/ui/form-feedback";
import { FormField } from "@/app/ui/form-field";
import { SubmitButton } from "@/app/ui/submit-button";

import { loginAction } from "./actions";

const initialState = {
  error: "",
};

export function LoginForm() {
  const [state, action] = useActionState(loginAction, initialState);

  return (
    <form className="form-stack" action={action}>
      <FormField id="email" label="Email" required>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-describedby={state.error ? "login-error" : undefined}
          aria-invalid={Boolean(state.error)}
        />
      </FormField>

      <FormField id="password" label="Mot de passe" required>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-describedby={state.error ? "login-error" : undefined}
          aria-invalid={Boolean(state.error)}
        />
      </FormField>

      <FormFeedback id="login-error" error={state.error} />

      <div className="form-actions">
        <SubmitButton pendingLabel="Connexion...">Se connecter</SubmitButton>
      </div>
    </form>
  );
}
