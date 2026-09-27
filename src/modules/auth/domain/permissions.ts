import { UserRole } from "@/modules/users/domain/user-role";

export function canManageUsers(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}

export function canAssignTicket(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.TECHNICIAN;
}

export function canManageCategories(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}
