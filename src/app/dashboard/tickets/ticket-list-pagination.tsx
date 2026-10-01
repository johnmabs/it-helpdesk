import Link from "next/link";

import type { TicketListFilters } from "@/modules/tickets/application/list-tickets";

type TicketListPaginationProps = {
  filters: TicketListFilters;
  page: number;
  total: number;
  totalPages: number;
};

export function TicketListPagination({
  filters,
  page,
  total,
  totalPages,
}: TicketListPaginationProps) {
  return (
    <nav className="ticket-pagination" aria-label="Pagination des tickets">
      <p>
        {total} ticket{total === 1 ? "" : "s"} — Page {page} sur {totalPages}
      </p>

      {page > 1 ? (
        <Link href={buildPageHref(page - 1, filters)}>Précédent</Link>
      ) : (
        <span aria-disabled="true">Précédent</span>
      )}

      {page < totalPages ? (
        <Link href={buildPageHref(page + 1, filters)}>Suivant</Link>
      ) : (
        <span aria-disabled="true">Suivant</span>
      )}
    </nav>
  );
}

function buildPageHref(page: number, filters: TicketListFilters): string {
  const searchParams = new URLSearchParams();

  if (filters.status) searchParams.set("status", filters.status);
  if (filters.priority) searchParams.set("priority", filters.priority);
  if (filters.categoryId) searchParams.set("category", filters.categoryId);
  if (filters.assignedToId) searchParams.set("assignee", filters.assignedToId);
  if (filters.createdById) searchParams.set("creator", filters.createdById);
  if (page > 1) searchParams.set("page", String(page));

  const query = searchParams.toString();

  return query ? `/dashboard/tickets?${query}` : "/dashboard/tickets";
}
