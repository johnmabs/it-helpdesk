"use server";

import { redirect } from "next/navigation";

import { PrismaCategoryRepository } from "@/modules/categories/infrastructure/persistence/prisma-category-repository";
import { requireAuthenticatedUser } from "@/modules/auth/application/require-authenticated-user";
import { CreateTicket } from "@/modules/tickets/application/create-ticket";
import { TicketHistoryRecorder } from "@/modules/tickets/application/ticket-history-recorder";
import { PrismaTicketHistoryRepository } from "@/modules/tickets/infrastructure/persistence/prisma-ticket-history-repository";
import { PrismaTicketRepository } from "@/modules/tickets/infrastructure/persistence/prisma-ticket-repository";
import {
  CategoryInactiveError,
  CategoryNotFoundError,
} from "@/shared/errors/application-error";
import { RandomIdGenerator } from "@/shared/identity/random-id-generator";
import { createTicketRequestSchema } from "@/shared/validation/request-schemas";

export type CreateTicketState = {
  error: string;
};

export async function createTicketAction(
  _previousState: CreateTicketState,
  formData: FormData,
): Promise<CreateTicketState> {
  const user = await requireAuthenticatedUser();

  const request = createTicketRequestSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    categoryId: formData.get("categoryId"),
  });

  if (!request.success) {
    const invalidPriority = request.error.issues.some(
      (issue) => issue.path[0] === "priority",
    );

    return {
      error: invalidPriority ? "Priorité invalide." : "Données invalides.",
    };
  }

  const createTicket = new CreateTicket(
    new PrismaTicketRepository(),
    new RandomIdGenerator(),
    new PrismaCategoryRepository(),
    new TicketHistoryRecorder(
      new PrismaTicketHistoryRepository(),
      new RandomIdGenerator(),
    ),
  );

  let result;

  try {
    result = await createTicket.execute({
      title: request.data.title,
      description: request.data.description,
      priority: request.data.priority,
      createdById: user.id,
      categoryId: request.data.categoryId,
    });
  } catch (error) {
    if (
      error instanceof CategoryNotFoundError ||
      error instanceof CategoryInactiveError
    ) {
      return {
        error: "La catégorie sélectionnée n'est plus disponible.",
      };
    }

    return {
      error: "Impossible de créer le ticket.",
    };
  }

  redirect(`/dashboard/tickets/${result.id}?feedback=ticket-created`);
}
