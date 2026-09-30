import { describe, expect, it } from "vitest";

import {
  ApplicationError,
  ConflictError,
  ForbiddenError,
  InvalidTicketTransitionError,
  NotFoundError,
  TicketNotFoundError,
} from "./application-error";

describe("application errors", () => {
  it("exposes a stable name, message and code", () => {
    const error = new TicketNotFoundError();

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApplicationError);
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.name).toBe("TicketNotFoundError");
    expect(error.message).toBe("Ticket not found");
    expect(error.code).toBe("TICKET_NOT_FOUND");
  });

  it("groups invalid ticket transitions as conflicts", () => {
    const error = new InvalidTicketTransitionError(
      "Only assigned tickets can be started",
    );

    expect(error).toBeInstanceOf(ConflictError);
    expect(error.code).toBe("INVALID_TICKET_TRANSITION");
    expect(error.message).toBe("Only assigned tickets can be started");
  });

  it("supports an explicit forbidden error message", () => {
    const error = new ForbiddenError("Not allowed to view this ticket");

    expect(error.name).toBe("ForbiddenError");
    expect(error.code).toBe("FORBIDDEN");
    expect(error.message).toBe("Not allowed to view this ticket");
  });
});
