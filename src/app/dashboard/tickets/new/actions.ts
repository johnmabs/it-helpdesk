"use server";

import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/modules/auth/application/require-authenticated-user";
import { CreateTicket } from "@/modules/tickets/application/create-ticket";
import { TicketPriority } from "@/modules/tickets/domain/ticket-priority";
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

  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof priority !== "string"
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
  );

  try {
    const result = await createTicket.execute({
      title,
      description,
      priority: priority as TicketPriority,
      createdById: user.id,
    });

    redirect(`/dashboard/tickets/${result.id}`);
  } catch {
    return {
      error: "Impossible de créer le ticket.",
    };
  }
}
