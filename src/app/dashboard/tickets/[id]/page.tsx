import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ActionFeedback } from "@/app/ui/action-feedback";
import { EmptyState } from "@/app/ui/empty-state";
import { requireAuthenticatedUser } from "@/modules/auth/application/require-authenticated-user";
import {
  canAssignTicket,
  canViewTicket,
} from "@/modules/auth/domain/permissions";
import { getTicketDetails } from "@/modules/tickets/application/get-ticket-details";
import { listTicketHistory } from "@/modules/tickets/application/list-ticket-history";
import { listAssignableUsers } from "@/modules/users/application/list-assignable-users";

import { AddTicketCommentForm } from "./add-ticket-comment-form";
import { TicketActions } from "./ticket-actions";
import { TicketHistoryTimeline } from "./ticket-history-timeline";

export const metadata: Metadata = {
  title: "Détail du ticket",
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    feedback?: string | string[];
  }>;
};

export default async function TicketPage({ params, searchParams }: PageProps) {
  const user = await requireAuthenticatedUser();

  const { id } = await params;
  const { feedback } = await searchParams;

  const ticket = await getTicketDetails(id);

  if (
    !ticket ||
    !canViewTicket(user, { createdById: ticket.createdBy.id })
  ) {
    notFound();
  }

  const [assignableUsers, history] = await Promise.all([
    canAssignTicket(user.role) ? listAssignableUsers() : Promise.resolve([]),
    listTicketHistory(ticket.id),
  ]);

  return (
    <main>
      <ActionFeedback
        message={feedback === "ticket-created" ? "Ticket créé." : ""}
        queryParameter="feedback"
      />

      <header className="ticket-heading">
        <h1>{ticket.title}</h1>

        <p>
          {ticket.status} · {ticket.priority}
        </p>
      </header>

      <section>
        <h2>Description</h2>

        <p>{ticket.description}</p>
      </section>

      <section>
        <h2>Informations</h2>

        <dl className="details-grid">
          <dt>Créé par</dt>
          <dd>{ticket.createdBy.name}</dd>

          <dt>Assigné à</dt>
          <dd>{ticket.assignedTo?.name ?? "Non assigné"}</dd>

          <dt>Catégorie</dt>
          <dd>{ticket.category?.name ?? "Non classé"}</dd>

          <dt>Créé le</dt>
          <dd>{ticket.createdAt.toLocaleString("fr-FR")}</dd>

          <dt>Mis à jour</dt>
          <dd>{ticket.updatedAt.toLocaleString("fr-FR")}</dd>
        </dl>
      </section>

      <TicketActions
        ticketId={ticket.id}
        status={ticket.status}
        priority={ticket.priority}
        role={user.role}
        assignableUsers={assignableUsers}
      />

      <TicketHistoryTimeline entries={history} />

      <section>
        <h2>Commentaires</h2>

        {ticket.comments.length === 0 ? (
          <EmptyState
            title="Aucun commentaire pour le moment."
            description="Les échanges liés à ce ticket apparaîtront ici."
          />
        ) : (
          <ol className="comment-list" aria-label="Commentaires du ticket">
            {ticket.comments.map((comment) => (
              <li key={comment.id}>
                <article>
                  <header>
                    <strong>{comment.author.name}</strong>{" "}
                    <time dateTime={comment.createdAt.toISOString()}>
                      {comment.createdAt.toLocaleString("fr-FR")}
                    </time>
                  </header>

                  <p>{comment.body}</p>
                </article>
              </li>
            ))}
          </ol>
        )}

        <AddTicketCommentForm ticketId={ticket.id} />
      </section>
    </main>
  );
}
