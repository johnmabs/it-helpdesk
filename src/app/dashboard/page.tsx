import Link from "next/link";

import { EmptyState } from "@/app/ui/empty-state";
import { requireAuthenticatedUser } from "@/modules/auth/application/require-authenticated-user";
import { getTechnicianWorkload } from "@/modules/tickets/application/get-technician-workload";
import { getTicketCategoryMetrics } from "@/modules/tickets/application/get-ticket-category-metrics";
import { getTicketSummaryMetrics } from "@/modules/tickets/application/get-ticket-summary-metrics";
import { listRecentTickets } from "@/modules/tickets/application/list-recent-tickets";
import { UserRole } from "@/modules/users/domain/user-role";

import { TechnicianWorkloadView } from "./technician-workload";

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser();
  const [metrics, categoryMetrics, recentTickets, technicianWorkload] =
    await Promise.all([
      getTicketSummaryMetrics(user),
      getTicketCategoryMetrics(user),
      listRecentTickets(user),
      user.role === UserRole.TECHNICIAN
        ? getTechnicianWorkload(user.id)
        : Promise.resolve(null),
    ]);

  const summary = [
    { label: "Tickets ouverts", value: metrics.open },
    { label: "Tickets assignés", value: metrics.assigned },
    { label: "En cours", value: metrics.inProgress },
    { label: "Tickets critiques", value: metrics.critical },
    { label: "Résolus aujourd'hui", value: metrics.resolvedToday },
  ];

  return (
    <main>
      <h1>Dashboard</h1>

      <section aria-labelledby="ticket-summary-heading">
        <h2 id="ticket-summary-heading">Activité des tickets</h2>

        <dl>
          {summary.map((metric) => (
            <div key={metric.label}>
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="category-metrics-heading">
        <h2 id="category-metrics-heading">Tickets par catégorie</h2>

        {categoryMetrics.length === 0 ? (
          <EmptyState
            title="Aucune catégorie configurée."
            description="Les indicateurs apparaîtront dès qu’une catégorie sera disponible."
          />
        ) : (
          <dl>
            {categoryMetrics.map((metric) => (
              <div key={metric.id}>
                <dt>
                  <Link href={`/dashboard/tickets?category=${metric.id}`}>
                    {metric.name}
                  </Link>
                </dt>
                <dd>{metric.ticketCount}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section aria-labelledby="recent-tickets-heading">
        <div>
          <h2 id="recent-tickets-heading">Tickets récents</h2>
          <Link href="/dashboard/tickets">Voir tous les tickets</Link>
        </div>

        {recentTickets.length === 0 ? (
          <EmptyState
            title="Aucun ticket récent."
            description="Les derniers tickets créés ou modifiés apparaîtront ici."
            action={
              <Link
                className="button button-primary"
                href="/dashboard/tickets/new"
              >
                Créer un ticket
              </Link>
            }
          />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Titre</th>
                <th>Priorité</th>
                <th>Catégorie</th>
                <th>Statut</th>
                <th>Assigné à</th>
                <th>Dernière activité</th>
              </tr>
            </thead>

            <tbody>
              {recentTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <Link href={`/dashboard/tickets/${ticket.id}`}>
                      {ticket.title}
                    </Link>
                  </td>
                  <td>{ticket.priority}</td>
                  <td>{ticket.categoryName ?? "Non classé"}</td>
                  <td>{ticket.status}</td>
                  <td>{ticket.assignedToName ?? "—"}</td>
                  <td>
                    <time dateTime={ticket.updatedAt.toISOString()}>
                      {ticket.updatedAt.toLocaleString("fr-FR")}
                    </time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {technicianWorkload ? (
        <TechnicianWorkloadView workload={technicianWorkload} />
      ) : null}

    </main>
  );
}
