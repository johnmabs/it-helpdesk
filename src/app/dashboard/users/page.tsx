import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/modules/auth/application/require-authenticated-user";
import { canManageUsers } from "@/modules/auth/domain/permissions";

export default async function UsersPage() {
  const user = await requireAuthenticatedUser();

  if (!canManageUsers(user.role)) {
    redirect("/access-denied");
  }

  return (
    <main>
      <h1>Utilisateurs</h1>
    </main>
  );
}
