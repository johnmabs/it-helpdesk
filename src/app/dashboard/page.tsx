import { requireAuthenticatedUser } from "@/modules/auth/application/require-authenticated-user";

import { logoutAction } from "./actions";

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser();

  return (
    <main>
      <h1>Dashboard</h1>

      <p>{user.email}</p>
      <p>{user.role}</p>

      <form action={logoutAction}>
        <button type="submit">Se déconnecter</button>
      </form>
    </main>
  );
}
