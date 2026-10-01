import type { ReactNode } from "react";

type EmptyStateProps = {
  action?: ReactNode;
  description?: string;
  title: string;
};

export function EmptyState({
  action,
  description,
  title,
}: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <span className="empty-state-mark" aria-hidden="true">
        —
      </span>
      <p className="empty-state-title">{title}</p>
      {description ? (
        <p className="empty-state-description">{description}</p>
      ) : null}
      {action ? <div className="empty-state-action">{action}</div> : null}
    </div>
  );
}
