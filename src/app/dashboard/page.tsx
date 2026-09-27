import { requireAuthenticatedUser } from "@/modules/auth/application/require-authenticated-user";

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser();

  return (
    <main>
      <h1>Dashboard</h1>

      <p>{user.email}</p>
      <p>{user.role}</p>
    </main>
  );
}
