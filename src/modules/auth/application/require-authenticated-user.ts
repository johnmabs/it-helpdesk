import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { UserRole } from "@/modules/users/domain/user-role";

export type AuthenticatedUser = {
  id: string;
  email: string | null;
  role: UserRole;
};

export async function requireAuthenticatedUser(): Promise<AuthenticatedUser> {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    role: session.user.role,
  };
}
