import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserRole } from "@/modules/users/domain/user-role";

const mocks = vi.hoisted(() => ({
  assignExecute: vi.fn(),
  closeExecute: vi.fn(),
  execute: vi.fn(),
  revalidatePath: vi.fn(),
  requireAuthenticatedUser: vi.fn(),
  resolveExecute: vi.fn(),
  startExecute: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/modules/auth/application/require-authenticated-user", () => ({
  requireAuthenticatedUser: mocks.requireAuthenticatedUser,
}));

vi.mock("@/modules/comments/application/add-ticket-comment", () => ({
  AddTicketComment: class {
    execute = mocks.execute;
  },
}));

vi.mock("@/modules/tickets/application/assign-ticket", () => ({
  AssignTicket: class {
    execute = mocks.assignExecute;
  },
}));

vi.mock("@/modules/tickets/application/close-ticket", () => ({
  CloseTicket: class {
    execute = mocks.closeExecute;
  },
}));

vi.mock("@/modules/tickets/application/resolve-ticket", () => ({
  ResolveTicket: class {
    execute = mocks.resolveExecute;
  },
}));

vi.mock("@/modules/tickets/application/start-ticket", () => ({
  StartTicket: class {
    execute = mocks.startExecute;
  },
}));

vi.mock(
  "@/modules/comments/infrastructure/persistence/prisma-ticket-comment-repository",
  () => ({
    PrismaTicketCommentRepository: class {},
  }),
);

vi.mock(
  "@/modules/tickets/infrastructure/persistence/prisma-ticket-repository",
  () => ({
    PrismaTicketRepository: class {},
  }),
);

vi.mock(
  "@/modules/tickets/infrastructure/persistence/prisma-ticket-history-repository",
  () => ({
    PrismaTicketHistoryRepository: class {},
  }),
);

vi.mock(
  "@/modules/users/infrastructure/persistence/prisma-user-repository",
  () => ({
    PrismaUserRepository: class {},
  }),
);

vi.mock("@/shared/identity/random-id-generator", () => ({
  RandomIdGenerator: class {},
}));

import {
  addTicketCommentAction,
  assignTicketAction,
  closeTicketAction,
  resolveTicketAction,
  startTicketAction,
} from "./actions";

const initialState = {
  error: "",
  submitted: false,
};

function commentFormData(body = "La pièce est disponible."): FormData {
  const formData = new FormData();
  formData.set("ticketId", "ticket-1");
  formData.set("body", body);

  return formData;
}

describe("addTicketCommentAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuthenticatedUser.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      role: UserRole.USER,
    });
  });

  it("ajoute le commentaire et actualise la page du ticket", async () => {
    mocks.execute.mockResolvedValue({ id: "comment-1" });

    await expect(
      addTicketCommentAction(initialState, commentFormData()),
    ).resolves.toEqual({ error: "", submitted: true });

    expect(mocks.execute).toHaveBeenCalledWith({
      ticketId: "ticket-1",
      body: "La pièce est disponible.",
      authenticatedUser: {
        id: "user-1",
        email: "user@example.com",
        role: UserRole.USER,
      },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/dashboard/tickets/ticket-1",
    );
  });

  it("rejette un commentaire vide avant d'appeler le cas d'usage", async () => {
    await expect(
      addTicketCommentAction(initialState, commentFormData("   ")),
    ).resolves.toEqual({
      error: "Le commentaire ne peut pas être vide.",
      submitted: false,
    });

    expect(mocks.execute).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("retourne une erreur lorsque l'utilisateur ne peut pas voir le ticket", async () => {
    mocks.execute.mockRejectedValue(
      new Error("Not allowed to view this ticket"),
    );

    await expect(
      addTicketCommentAction(initialState, commentFormData()),
    ).resolves.toEqual({
      error: "Vous n'êtes pas autorisé à commenter ce ticket.",
      submitted: false,
    });

    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});

describe("ticket workflow actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuthenticatedUser.mockResolvedValue({
      id: "actor-1",
      email: "actor@example.com",
      role: UserRole.TECHNICIAN,
    });
  });

  it("uses the authenticated user as the assignment actor", async () => {
    const formData = new FormData();
    formData.set("ticketId", "ticket-1");
    formData.set("technicianId", "technician-1");

    await assignTicketAction(formData);

    expect(mocks.assignExecute).toHaveBeenCalledWith({
      ticketId: "ticket-1",
      technicianId: "technician-1",
      actorId: "actor-1",
    });
  });

  it.each([
    ["start", startTicketAction, mocks.startExecute],
    ["resolve", resolveTicketAction, mocks.resolveExecute],
    ["close", closeTicketAction, mocks.closeExecute],
  ])("uses the authenticated user for the %s transition", async (_, action, execute) => {
    const formData = new FormData();
    formData.set("ticketId", "ticket-1");

    await action(formData);

    expect(execute).toHaveBeenCalledWith({
      ticketId: "ticket-1",
      actorId: "actor-1",
    });
  });
});
