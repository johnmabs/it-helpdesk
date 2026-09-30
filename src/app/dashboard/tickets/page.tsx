import Link from "next/link";

import { requireAuthenticatedUser } from "@/modules/auth/application/require-authenticated-user";
import { getTicketFilterOptions } from "@/modules/tickets/application/get-ticket-filter-options";
import {
  listTickets,
  parseTicketListFilters,
  parseTicketListPage,
} from "@/modules/tickets/application/list-tickets";
import { TicketPriority } from "@/modules/tickets/domain/ticket-priority";
import { TicketStatus } from "@/modules/tickets/domain/ticket-status";

import { TicketListPagination } from "./ticket-list-pagination";

type TicketsPageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >;
};

export default async function TicketsPage({
  searchParams,
}: TicketsPageProps) {
  const user = await requireAuthenticatedUser();
  const params = await searchParams;
  const filters = parseTicketListFilters(params);
  const requestedPage = parseTicketListPage(params.page);

  const [ticketPage, filterOptions] = await Promise.all([
    listTickets(user, filters, requestedPage),
    getTicketFilterOptions(user),
  ]);

  return (
    <main>
      <div>
        <h1>Tickets</h1>

        <Link href="/dashboard/tickets/new">Nouveau ticket</Link>
      </div>

      <form method="get">
        <div>
          <label htmlFor="status">Statut</label>
          <select
            id="status"
            name="status"
            defaultValue={filters.status ?? ""}
          >
            <option value="">Tous</option>
            {Object.values(TicketStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="priority">Priorité</label>
          <select
            id="priority"
            name="priority"
            defaultValue={filters.priority ?? ""}
          >
            <option value="">Toutes</option>
            {Object.values(TicketPriority).map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="category">Catégorie</label>
          <select
            id="category"
            name="category"
            defaultValue={filters.categoryId ?? ""}
          >
            <option value="">Toutes</option>
            {filterOptions.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="assignee">Technicien assigné</label>
          <select
            id="assignee"
            name="assignee"
            defaultValue={filters.assignedToId ?? ""}
          >
            <option value="">Tous</option>
            <option value="unassigned">Non assigné</option>
            {filterOptions.technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="creator">Créateur</label>
          <select
            id="creator"
            name="creator"
            defaultValue={filters.createdById ?? ""}
          >
            <option value="">Tous</option>
            {filterOptions.creators.map((creator) => (
              <option key={creator.id} value={creator.id}>
                {creator.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">Filtrer</button>
        <Link href="/dashboard/tickets">Réinitialiser</Link>
      </form>

      {ticketPage.items.length === 0 ? (
        <p>Aucun ticket ne correspond aux filtres.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Priorité</th>
              <th>Catégorie</th>
              <th>Statut</th>
              <th>Créé par</th>
              <th>Assigné à</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {ticketPage.items.map((ticket) => (
              <tr key={ticket.id}>
                <td>
                  <Link href={`/dashboard/tickets/${ticket.id}`}>
                    {ticket.title}
                  </Link>
                </td>

                <td>{ticket.priority}</td>
                <td>{ticket.categoryName ?? "Non classé"}</td>
                <td>{ticket.status}</td>
                <td>{ticket.createdByName}</td>

                <td>{ticket.assignedToName ?? "—"}</td>

                <td>{ticket.createdAt.toLocaleString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <TicketListPagination
        filters={filters}
        page={ticketPage.page}
        total={ticketPage.total}
        totalPages={ticketPage.totalPages}
      />
    </main>
  );
}
