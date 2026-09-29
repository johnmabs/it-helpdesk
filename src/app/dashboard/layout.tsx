import Link from "next/link";
import type { ReactNode } from "react";

import { requireAuthenticatedUser } from "@/modules/auth/application/require-authenticated-user";
import { canManageCategories } from "@/modules/auth/domain/permissions";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user = await requireAuthenticatedUser();

  return (
    <div className="dashboard">
      <aside>
        <nav aria-label="Navigation principale">
          <ul>
            <li>
              <Link href="/dashboard">Tableau de bord</Link>
            </li>
            <li>
              <Link href="/dashboard/tickets">Tickets</Link>
            </li>
            {canManageCategories(user.role) ? (
              <li>
                <Link href="/admin/categories">Catégories</Link>
              </li>
            ) : null}
          </ul>
        </nav>
      </aside>

      <div>
        <header>{/* Header */}</header>

        <main>{children}</main>
      </div>
    </div>
  );
}
