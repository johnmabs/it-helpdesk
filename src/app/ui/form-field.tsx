import type { ReactNode } from "react";

type FormFieldProps = {
  children: ReactNode;
  id: string;
  label: string;
  required?: boolean;
};

export function FormField({
  children,
  id,
  label,
  required = false,
}: FormFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label}
        {required ? (
          <span className="form-required" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
    </div>
  );
}
