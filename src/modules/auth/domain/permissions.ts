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

export type TicketViewer = {
  id: string;
  role: UserRole;
};

export type ViewableTicket = {
  createdById: string;
};

export function canViewTicket(
  viewer: TicketViewer,
  ticket: ViewableTicket,
): boolean {
  return (
    viewer.role === UserRole.ADMIN ||
    viewer.role === UserRole.TECHNICIAN ||
    ticket.createdById === viewer.id
  );
}
