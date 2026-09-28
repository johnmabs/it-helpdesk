"use server";

import { revalidatePath } from "next/cache";

import { requireAuthenticatedUser } from "@/modules/auth/application/require-authenticated-user";
import { AssignTicket } from "@/modules/tickets/application/assign-ticket";
import { CloseTicket } from "@/modules/tickets/application/close-ticket";
import { ResolveTicket } from "@/modules/tickets/application/resolve-ticket";
import { StartTicket } from "@/modules/tickets/application/start-ticket";
import { PrismaTicketRepository } from "@/modules/tickets/infrastructure/persistence/prisma-ticket-repository";
import { PrismaUserRepository } from "@/modules/users/infrastructure/persistence/prisma-user-repository";

function getTicketId(formData: FormData): string {
  const ticketId = formData.get("ticketId");

  if (typeof ticketId !== "string") {
    throw new Error("Invalid ticket id");
  }

  return ticketId;
}

export async function assignTicketAction(formData: FormData) {
  await requireAuthenticatedUser();

  const ticketId = getTicketId(formData);

  const technicianId = formData.get("technicianId");

  if (typeof technicianId !== "string") {
    throw new Error("Invalid technician id");
  }

  const useCase = new AssignTicket(
    new PrismaTicketRepository(),
    new PrismaUserRepository(),
  );

  await useCase.execute({
    ticketId,
    technicianId,
  });

  revalidatePath(`/tickets/${ticketId}`);
}

export async function startTicketAction(formData: FormData) {
  await requireAuthenticatedUser();

  const ticketId = getTicketId(formData);

  const useCase = new StartTicket(new PrismaTicketRepository());

  await useCase.execute(ticketId);

  revalidatePath(`/tickets/${ticketId}`);
}

export async function resolveTicketAction(formData: FormData) {
  await requireAuthenticatedUser();

  const ticketId = getTicketId(formData);

  const useCase = new ResolveTicket(new PrismaTicketRepository());

  await useCase.execute(ticketId);

  revalidatePath(`/tickets/${ticketId}`);
}

export async function closeTicketAction(formData: FormData) {
  await requireAuthenticatedUser();

  const ticketId = getTicketId(formData);

  const useCase = new CloseTicket(new PrismaTicketRepository());

  await useCase.execute(ticketId);

  revalidatePath(`/tickets/${ticketId}`);
}
