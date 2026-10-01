"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: string;
  disabled?: boolean;
  pendingLabel: string;
  variant?: "primary" | "secondary" | "danger";
};

export function SubmitButton({
  children,
  disabled = false,
  pendingLabel,
  variant = "primary",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <button
      className={`button button-${variant}`}
      type="submit"
      disabled={isDisabled}
      aria-disabled={isDisabled}
    >
      {pending ? <span className="button-spinner" aria-hidden="true" /> : null}
      {pending ? pendingLabel : children}
    </button>
  );
}
