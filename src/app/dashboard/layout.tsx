import type { ReactNode } from "react";

import { requireAuthenticatedUser } from "@/modules/auth/application/require-authenticated-user";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  await requireAuthenticatedUser();

  return (
    <div className="dashboard">
      <aside>{/* Sidebar */}</aside>

      <div>
        <header>{/* Header */}</header>

        <main>{children}</main>
      </div>
    </div>
  );
}
