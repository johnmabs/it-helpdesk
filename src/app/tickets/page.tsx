import Link from "next/link";

import { requireAuthenticatedUser } from "@/modules/auth/application/require-authenticated-user";
import { listTickets } from "@/modules/tickets/application/list-tickets";

export default async function TicketsPage() {
  await requireAuthenticatedUser();

  const tickets = await listTickets();

  return (
    <main>
      <div>
        <h1>Tickets</h1>

        <Link href="/tickets/new">Nouveau ticket</Link>
      </div>

      {tickets.length === 0 ? (
        <p>Aucun ticket pour le moment.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Priorité</th>
              <th>Statut</th>
              <th>Créé par</th>
              <th>Assigné à</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>
                  <Link href={`/tickets/${ticket.id}`}>{ticket.title}</Link>
                </td>

                <td>{ticket.priority}</td>
                <td>{ticket.status}</td>
                <td>{ticket.createdByName}</td>

                <td>{ticket.assignedToName ?? "—"}</td>

                <td>{ticket.createdAt.toLocaleString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
