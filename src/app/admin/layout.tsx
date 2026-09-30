import type { ReactNode } from "react";

import { ApplicationShell } from "@/app/application-shell";
import { requireAuthenticatedUser } from "@/modules/auth/application/require-authenticated-user";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await requireAuthenticatedUser();

  return <ApplicationShell user={user}>{children}</ApplicationShell>;
}
