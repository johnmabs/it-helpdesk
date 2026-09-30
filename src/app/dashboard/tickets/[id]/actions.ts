"use server";

import { revalidatePath } from "next/cache";

import { requireAuthenticatedUser } from "@/modules/auth/application/require-authenticated-user";
import { AddTicketComment } from "@/modules/comments/application/add-ticket-comment";
import { PrismaTicketCommentRepository } from "@/modules/comments/infrastructure/persistence/prisma-ticket-comment-repository";
import { AssignTicket } from "@/modules/tickets/application/assign-ticket";
import { CloseTicket } from "@/modules/tickets/application/close-ticket";
import { ResolveTicket } from "@/modules/tickets/application/resolve-ticket";
import { StartTicket } from "@/modules/tickets/application/start-ticket";
import { TicketHistoryRecorder } from "@/modules/tickets/application/ticket-history-recorder";
import { PrismaTicketHistoryRepository } from "@/modules/tickets/infrastructure/persistence/prisma-ticket-history-repository";
import { PrismaTicketRepository } from "@/modules/tickets/infrastructure/persistence/prisma-ticket-repository";
import { PrismaUserRepository } from "@/modules/users/infrastructure/persistence/prisma-user-repository";
import { RandomIdGenerator } from "@/shared/identity/random-id-generator";

export type AddTicketCommentState = {
  error: string;
  submitted: boolean;
};

function createTicketHistoryRecorder(): TicketHistoryRecorder {
  return new TicketHistoryRecorder(
    new PrismaTicketHistoryRepository(),
    new RandomIdGenerator(),
  );
}

function getTicketId(formData: FormData): string {
  const ticketId = formData.get("ticketId");

  if (typeof ticketId !== "string") {
    throw new Error("Invalid ticket id");
  }

  return ticketId;
}

export async function assignTicketAction(formData: FormData) {
  const user = await requireAuthenticatedUser();

  const ticketId = getTicketId(formData);

  const technicianId = formData.get("technicianId");

  if (typeof technicianId !== "string") {
    throw new Error("Invalid technician id");
  }

  const useCase = new AssignTicket(
    new PrismaTicketRepository(),
    new PrismaUserRepository(),
    createTicketHistoryRecorder(),
  );

  await useCase.execute({
    ticketId,
    technicianId,
    actorId: user.id,
  });

  revalidatePath(`/dashboard/tickets/${ticketId}`);
}

export async function startTicketAction(formData: FormData) {
  const user = await requireAuthenticatedUser();

  const ticketId = getTicketId(formData);

  const useCase = new StartTicket(
    new PrismaTicketRepository(),
    createTicketHistoryRecorder(),
  );

  await useCase.execute({ ticketId, actorId: user.id });

  revalidatePath(`/dashboard/tickets/${ticketId}`);
}

export async function resolveTicketAction(formData: FormData) {
  const user = await requireAuthenticatedUser();

  const ticketId = getTicketId(formData);

  const useCase = new ResolveTicket(
    new PrismaTicketRepository(),
    createTicketHistoryRecorder(),
  );

  await useCase.execute({ ticketId, actorId: user.id });

  revalidatePath(`/dashboard/tickets/${ticketId}`);
}

export async function closeTicketAction(formData: FormData) {
  const user = await requireAuthenticatedUser();

  const ticketId = getTicketId(formData);

  const useCase = new CloseTicket(
    new PrismaTicketRepository(),
    createTicketHistoryRecorder(),
  );

  await useCase.execute({ ticketId, actorId: user.id });

  revalidatePath(`/dashboard/tickets/${ticketId}`);
}

export async function addTicketCommentAction(
  _previousState: AddTicketCommentState,
  formData: FormData,
): Promise<AddTicketCommentState> {
  const user = await requireAuthenticatedUser();
  const ticketId = formData.get("ticketId");
  const body = formData.get("body");

  if (
    typeof ticketId !== "string" ||
    !ticketId.trim() ||
    typeof body !== "string" ||
    !body.trim()
  ) {
    return {
      error: "Le commentaire ne peut pas être vide.",
      submitted: false,
    };
  }

  const addTicketComment = new AddTicketComment(
    new PrismaTicketRepository(),
    new PrismaTicketCommentRepository(),
    new RandomIdGenerator(),
    createTicketHistoryRecorder(),
  );

  try {
    await addTicketComment.execute({
      ticketId,
      body,
      authenticatedUser: user,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Ticket not found") {
        return {
          error: "Ticket introuvable.",
          submitted: false,
        };
      }

      if (error.message === "Not allowed to view this ticket") {
        return {
          error: "Vous n'êtes pas autorisé à commenter ce ticket.",
          submitted: false,
        };
      }
    }

    return {
      error: "Impossible d'ajouter le commentaire.",
      submitted: false,
    };
  }

  revalidatePath(`/dashboard/tickets/${ticketId}`);

  return {
    error: "",
    submitted: true,
  };
}
