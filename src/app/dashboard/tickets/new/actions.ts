"use server";

import { redirect } from "next/navigation";

import { PrismaCategoryRepository } from "@/modules/categories/infrastructure/persistence/prisma-category-repository";
import { requireAuthenticatedUser } from "@/modules/auth/application/require-authenticated-user";
import { CreateTicket } from "@/modules/tickets/application/create-ticket";
import { TicketHistoryRecorder } from "@/modules/tickets/application/ticket-history-recorder";
import { TicketPriority } from "@/modules/tickets/domain/ticket-priority";
import { PrismaTicketHistoryRepository } from "@/modules/tickets/infrastructure/persistence/prisma-ticket-history-repository";
import { PrismaTicketRepository } from "@/modules/tickets/infrastructure/persistence/prisma-ticket-repository";
import { RandomIdGenerator } from "@/shared/identity/random-id-generator";

export type CreateTicketState = {
  error: string;
};

export async function createTicketAction(
  _previousState: CreateTicketState,
  formData: FormData,
): Promise<CreateTicketState> {
  const user = await requireAuthenticatedUser();

  const title = formData.get("title");
  const description = formData.get("description");
  const priority = formData.get("priority");
  const categoryId = formData.get("categoryId");

  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof priority !== "string" ||
    typeof categoryId !== "string" ||
    !categoryId.trim()
  ) {
    return {
      error: "Données invalides.",
    };
  }

  if (!Object.values(TicketPriority).includes(priority as TicketPriority)) {
    return {
      error: "Priorité invalide.",
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
      title,
      description,
      priority: priority as TicketPriority,
      createdById: user.id,
      categoryId,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Category not found" ||
        error.message === "Category is inactive")
    ) {
      return {
        error: "La catégorie sélectionnée n'est plus disponible.",
      };
    }

    return {
      error: "Impossible de créer le ticket.",
    };
  }

  redirect(`/dashboard/tickets/${result.id}`);
}
