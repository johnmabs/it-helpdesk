import { EmptyState } from "@/app/ui/empty-state";
import type { TicketHistoryListItem } from "@/modules/tickets/application/list-ticket-history";
import { TicketHistoryAction } from "@/modules/tickets/domain/ticket-history-action";

type TicketHistoryTimelineProps = {
  entries: TicketHistoryListItem[];
};

export function TicketHistoryTimeline({
  entries,
}: TicketHistoryTimelineProps) {
  return (
    <section>
      <h2>Historique</h2>

      {entries.length === 0 ? (
        <EmptyState
          title="Aucun événement enregistré."
          description="Les modifications importantes du ticket apparaîtront ici."
        />
      ) : (
        <ol className="history-list" aria-label="Historique du ticket">
          {entries.map((entry) => (
            <li key={entry.id}>
              <time
                dateTime={entry.createdAt.toISOString()}
                title={entry.createdAt.toLocaleString("fr-FR")}
              >
                {entry.createdAt.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>{" "}
              <span>{formatTicketHistoryDescription(entry)}</span>{" "}
              <small>par {entry.actorName}</small>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function formatTicketHistoryDescription(
  entry: Pick<
    TicketHistoryListItem,
    "action" | "oldValueLabel" | "newValueLabel"
  >,
): string {
  switch (entry.action) {
    case TicketHistoryAction.TICKET_CREATED:
      return "Ticket créé";
    case TicketHistoryAction.PRIORITY_CHANGED:
      return `Priorité ${valueOrFallback(entry.oldValueLabel)} → ${valueOrFallback(entry.newValueLabel)}`;
    case TicketHistoryAction.ASSIGNED:
      return entry.oldValueLabel
        ? `Affectation ${entry.oldValueLabel} → ${valueOrFallback(entry.newValueLabel)}`
        : `Assigné à ${valueOrFallback(entry.newValueLabel)}`;
    case TicketHistoryAction.STATUS_CHANGED:
      return `${valueOrFallback(entry.oldValueLabel)} → ${valueOrFallback(entry.newValueLabel)}`;
    case TicketHistoryAction.CATEGORY_CHANGED:
      return `Catégorie ${entry.oldValueLabel ?? "Non classé"} → ${entry.newValueLabel ?? "Non classé"}`;
    case TicketHistoryAction.COMMENT_ADDED:
      return "Commentaire ajouté";
  }
}

function valueOrFallback(value: string | null): string {
  return value ?? "—";
}
