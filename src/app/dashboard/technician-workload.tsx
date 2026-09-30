import Link from "next/link";

import type {
  TechnicianWorkload,
  TechnicianWorkloadTicket,
} from "@/modules/tickets/application/get-technician-workload";

type TechnicianWorkloadProps = {
  workload: TechnicianWorkload;
};

export function TechnicianWorkloadView({
  workload,
}: TechnicianWorkloadProps) {
  return (
    <section aria-labelledby="technician-workload-heading">
      <h2 id="technician-workload-heading">Ma charge de travail</h2>

      <WorkloadList
        heading="Mes tickets assignés"
        emptyMessage="Aucun ticket assigné."
        tickets={workload.assigned}
      />
      <WorkloadList
        heading="Mes tickets en cours"
        emptyMessage="Aucun ticket en cours."
        tickets={workload.inProgress}
      />
      <WorkloadList
        heading="Récemment résolus"
        emptyMessage="Aucun ticket résolu récemment."
        tickets={workload.recentlyResolved}
        showResolvedAt
      />
    </section>
  );
}

type WorkloadListProps = {
  heading: string;
  emptyMessage: string;
  tickets: TechnicianWorkloadTicket[];
  showResolvedAt?: boolean;
};

function WorkloadList({
  heading,
  emptyMessage,
  tickets,
  showResolvedAt = false,
}: WorkloadListProps) {
  const headingId = heading.toLowerCase().replaceAll(" ", "-");

  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId}>{heading}</h3>

      {tickets.length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        <ul>
          {tickets.map((ticket) => {
            const activityDate =
              showResolvedAt && ticket.resolvedAt
                ? ticket.resolvedAt
                : ticket.updatedAt;

            return (
              <li key={ticket.id}>
                <Link href={`/dashboard/tickets/${ticket.id}`}>
                  {ticket.title}
                </Link>{" "}
                <span>{ticket.priority}</span>{" "}
                <time dateTime={activityDate.toISOString()}>
                  {activityDate.toLocaleString("fr-FR")}
                </time>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
