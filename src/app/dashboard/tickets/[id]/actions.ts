"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";

import { requireAuthenticatedUser } from "@/modules/auth/application/require-authenticated-user";
import { canManageTickets } from "@/modules/auth/domain/permissions";
import { UserRole } from "@/modules/users/domain/user-role";
import { AddTicketComment } from "@/modules/comments/application/add-ticket-comment";
import { PrismaTicketCommentRepository } from "@/modules/comments/infrastructure/persistence/prisma-ticket-comment-repository";
import { AssignTicket } from "@/modules/tickets/application/assign-ticket";
import { CloseTicket } from "@/modules/tickets/application/close-ticket";
import { ChangeTicketPriority } from "@/modules/tickets/application/change-ticket-priority";
import { ResolveTicket } from "@/modules/tickets/application/resolve-ticket";
import { StartTicket } from "@/modules/tickets/application/start-ticket";
import { TicketHistoryRecorder } from "@/modules/tickets/application/ticket-history-recorder";
import { PrismaTicketHistoryRepository } from "@/modules/tickets/infrastructure/persistence/prisma-ticket-history-repository";
import { PrismaTicketRepository } from "@/modules/tickets/infrastructure/persistence/prisma-ticket-repository";
import { PrismaUserRepository } from "@/modules/users/infrastructure/persistence/prisma-user-repository";
import {
  ForbiddenError,
  TicketNotFoundError,
  ValidationError,
} from "@/shared/errors/application-error";
import { RandomIdGenerator } from "@/shared/identity/random-id-generator";
import {
  addTicketCommentRequestSchema,
  changeTicketPriorityRequestSchema,
} from "@/shared/validation/request-schemas";

export type AddTicketCommentState = {
  error: string;
  submitted: boolean;
};

export type TicketActionState = {
  error: string;
  message: string;
};

const ticketActionMessages = {
  assign: "Ticket assigné.",
  changePriority: "Priorité modifiée.",
  close: "Ticket clôturé.",
  resolve: "Ticket résolu.",
  start: "Ticket démarré.",
} as const;

type TicketActionIntent = keyof typeof ticketActionMessages;

function createTicketHistoryRecorder(): TicketHistoryRecorder {
  return new TicketHistoryRecorder(
    new PrismaTicketHistoryRepository(),
    new RandomIdGenerator(),
  );
}

function requireTicketManager(role: UserRole): void {
  if (!canManageTickets(role)) {
    throw new ForbiddenError("Not allowed to manage ticket workflow");
  }
}

function getTicketId(formData: FormData): string {
  const ticketId = formData.get("ticketId");

  if (typeof ticketId !== "string") {
    throw new ValidationError("Invalid ticket id");
  }

  return ticketId;
}

export async function assignTicketAction(formData: FormData) {
  const user = await requireAuthenticatedUser();
  requireTicketManager(user.role);

  const ticketId = getTicketId(formData);

  const technicianId = formData.get("technicianId");

  if (typeof technicianId !== "string") {
    throw new ValidationError("Invalid technician id");
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
  requireTicketManager(user.role);

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
  requireTicketManager(user.role);

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
  requireTicketManager(user.role);

  const ticketId = getTicketId(formData);

  const useCase = new CloseTicket(
    new PrismaTicketRepository(),
    createTicketHistoryRecorder(),
  );

  await useCase.execute({ ticketId, actorId: user.id });

  revalidatePath(`/dashboard/tickets/${ticketId}`);
}

export async function changeTicketPriorityAction(formData: FormData) {
  const user = await requireAuthenticatedUser();
  requireTicketManager(user.role);

  const request = changeTicketPriorityRequestSchema.safeParse({
    ticketId: formData.get("ticketId"),
    priority: formData.get("priority"),
  });

  if (!request.success) {
    throw new ValidationError("Invalid ticket priority change");
  }

  const useCase = new ChangeTicketPriority(
    new PrismaTicketRepository(),
    createTicketHistoryRecorder(),
  );

  await useCase.execute({
    ticketId: request.data.ticketId,
    priority: request.data.priority,
    actorId: user.id,
  });

  revalidatePath(`/dashboard/tickets/${request.data.ticketId}`);
}

export async function submitTicketAction(
  _previousState: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const intent = formData.get("intent");

  try {
    if (!isTicketActionIntent(intent)) {
      throw new ValidationError("Invalid ticket action");
    }

    switch (intent) {
      case "assign":
        await assignTicketAction(formData);
        break;
      case "changePriority":
        await changeTicketPriorityAction(formData);
        break;
      case "close":
        await closeTicketAction(formData);
        break;
      case "resolve":
        await resolveTicketAction(formData);
        break;
      case "start":
        await startTicketAction(formData);
        break;
    }

    return {
      error: "",
      message: ticketActionMessages[intent],
    };
  } catch (error) {
    unstable_rethrow(error);

    return {
      error: "Action impossible.",
      message: "",
    };
  }
}

export async function addTicketCommentAction(
  _previousState: AddTicketCommentState,
  formData: FormData,
): Promise<AddTicketCommentState> {
  const user = await requireAuthenticatedUser();
  const request = addTicketCommentRequestSchema.safeParse({
    ticketId: formData.get("ticketId"),
    body: formData.get("body"),
  });

  if (!request.success) {
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
      ticketId: request.data.ticketId,
      body: request.data.body,
      authenticatedUser: user,
    });
  } catch (error) {
    if (error instanceof TicketNotFoundError) {
      return {
        error: "Ticket introuvable.",
        submitted: false,
      };
    }

    if (error instanceof ForbiddenError) {
      return {
        error: "Vous n'êtes pas autorisé à commenter ce ticket.",
        submitted: false,
      };
    }

    return {
      error: "Impossible d'ajouter le commentaire.",
      submitted: false,
    };
  }

  revalidatePath(`/dashboard/tickets/${request.data.ticketId}`);

  return {
    error: "",
    submitted: true,
  };
}

function isTicketActionIntent(
  value: FormDataEntryValue | null,
): value is TicketActionIntent {
  return (
    typeof value === "string" && Object.hasOwn(ticketActionMessages, value)
  );
}
