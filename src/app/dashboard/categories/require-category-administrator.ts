import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/modules/auth/application/require-authenticated-user";
import { canManageCategories } from "@/modules/auth/domain/permissions";

export async function requireCategoryAdministrator(): Promise<void> {
  const user = await requireAuthenticatedUser();

  if (!canManageCategories(user.role)) {
    redirect("/access-denied");
  }
}
