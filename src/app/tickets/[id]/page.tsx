import { notFound } from "next/navigation";

import { requireAuthenticatedUser } from "@/modules/auth/application/require-authenticated-user";
import { getTicketDetails } from "@/modules/tickets/application/get-ticket-details";

import { TicketActions } from "./ticket-actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TicketPage({ params }: PageProps) {
  const user = await requireAuthenticatedUser();

  const { id } = await params;

  const ticket = await getTicketDetails(id);

  if (!ticket) {
    notFound();
  }

  return (
    <main>
      <header>
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

        <dl>
          <dt>Créé par</dt>
          <dd>{ticket.createdBy.name}</dd>

          <dt>Assigné à</dt>
          <dd>{ticket.assignedTo?.name ?? "Non assigné"}</dd>

          <dt>Créé le</dt>
          <dd>{ticket.createdAt.toLocaleString("fr-FR")}</dd>

          <dt>Mis à jour</dt>
          <dd>{ticket.updatedAt.toLocaleString("fr-FR")}</dd>
        </dl>
      </section>

      <TicketActions
        ticketId={ticket.id}
        status={ticket.status}
        role={user.role}
      />
    </main>
  );
}
