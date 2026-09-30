import { requireAuthenticatedUser } from "@/modules/auth/application/require-authenticated-user";
import { getTicketSummaryMetrics } from "@/modules/tickets/application/get-ticket-summary-metrics";

import { logoutAction } from "./actions";

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser();
  const metrics = await getTicketSummaryMetrics(user);

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

      <p>{user.email}</p>
      <p>{user.role}</p>

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

      <form action={logoutAction}>
        <button type="submit">Se déconnecter</button>
      </form>
    </main>
  );
}
