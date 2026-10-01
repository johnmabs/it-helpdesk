import type { ReactNode } from "react";

type PageStateProps = {
  actions?: ReactNode;
  code?: string;
  description: string;
  title: string;
};

export function PageState({
  actions,
  code,
  description,
  title,
}: PageStateProps) {
  return (
    <main className="page-state">
      <div className="page-state-card">
        {code ? <p className="page-state-code">{code}</p> : null}
        <h1>{title}</h1>
        <p className="page-state-description">{description}</p>
        {actions ? <div className="page-state-actions">{actions}</div> : null}
      </div>
    </main>
  );
}
