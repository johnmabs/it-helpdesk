import Link from "next/link";
import type { ReactNode } from "react";

import type { AuthenticatedUser } from "@/modules/auth/application/require-authenticated-user";
import {
  canManageCategories,
  canManageUsers,
} from "@/modules/auth/domain/permissions";
import { UserRole } from "@/modules/users/domain/user-role";

import { logoutAction } from "./actions";
import {
  ApplicationNavigation,
  type ApplicationNavigationItem,
} from "./application-navigation";

type ApplicationShellProps = {
  children: ReactNode;
  user: AuthenticatedUser;
};

const roleLabels: Record<UserRole, string> = {
  [UserRole.USER]: "Demandeur",
  [UserRole.TECHNICIAN]: "Technicien",
  [UserRole.ADMIN]: "Administrateur",
};

export function ApplicationShell({ children, user }: ApplicationShellProps) {
  const navigation: ApplicationNavigationItem[] = [
    { href: "/dashboard", label: "Vue d’ensemble", exact: true },
    { href: "/dashboard/tickets", label: "Tickets" },
    { href: "/dashboard/tickets/new", label: "Nouveau ticket", exact: true },
    ...(canManageCategories(user.role)
      ? [{ href: "/admin/categories", label: "Catégories" }]
      : []),
    ...(canManageUsers(user.role)
      ? [{ href: "/dashboard/users", label: "Utilisateurs" }]
      : []),
  ];
  const email = user.email ?? "Utilisateur connecté";
  const avatarLabel = email.charAt(0).toUpperCase();

  return (
    <>
      <a className="skip-link" href="#application-content">
        Aller au contenu
      </a>

      <div className="app-shell">
        <aside className="app-sidebar">
          <Link className="app-brand" href="/dashboard">
            <span className="app-brand-mark" aria-hidden="true">
              IH
            </span>
            <span>
              <strong>IT Helpdesk</strong>
              <small>Centre de support</small>
            </span>
          </Link>

          <ApplicationNavigation items={navigation} />

          <div className="app-sidebar-footer">
            <span className="app-status-dot" aria-hidden="true" />
            Service opérationnel
          </div>
        </aside>

        <div className="app-workspace">
          <header className="app-header">
            <div>
              <p className="app-header-eyebrow">Espace support</p>
              <p className="app-header-description">
                Suivez et résolvez les demandes de l’équipe.
              </p>
            </div>

            <details className="user-menu">
              <summary aria-label={`Menu utilisateur, ${email}`}>
                <span className="user-avatar" aria-hidden="true">
                  {avatarLabel}
                </span>
                <span className="user-menu-summary">
                  <strong>{email}</strong>
                  <small>{roleLabels[user.role]}</small>
                </span>
                <span className="user-menu-chevron" aria-hidden="true">
                  ▾
                </span>
              </summary>

              <div className="user-menu-panel">
                <div>
                  <strong>{email}</strong>
                  <span>{roleLabels[user.role]}</span>
                </div>
                <form action={logoutAction}>
                  <button type="submit">Se déconnecter</button>
                </form>
              </div>
            </details>
          </header>

          <div id="application-content" className="app-content" tabIndex={-1}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
