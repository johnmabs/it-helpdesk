export class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, code = "VALIDATION_ERROR") {
    super(message, code);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string, code = "NOT_FOUND") {
    super(message, code);
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string, code = "CONFLICT") {
    super(message, code);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message: string, code = "UNAUTHORIZED") {
    super(message, code);
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message = "Forbidden") {
    super(message, "FORBIDDEN");
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor(message = "User not found") {
    super(message, "USER_NOT_FOUND");
  }
}

export class TicketNotFoundError extends NotFoundError {
  constructor() {
    super("Ticket not found", "TICKET_NOT_FOUND");
  }
}

export class CategoryNotFoundError extends NotFoundError {
  constructor() {
    super("Category not found", "CATEGORY_NOT_FOUND");
  }
}

export class InvalidTicketTransitionError extends ConflictError {
  constructor(message: string) {
    super(message, "INVALID_TICKET_TRANSITION");
  }
}

export class AuthenticationRequiredError extends UnauthorizedError {
  constructor() {
    super("Authentication required", "AUTHENTICATION_REQUIRED");
  }
}

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super("Invalid credentials", "INVALID_CREDENTIALS");
  }
}

export class CategoryNameAlreadyExistsError extends ConflictError {
  constructor() {
    super("Category name already exists", "CATEGORY_NAME_ALREADY_EXISTS");
  }
}

export class CategoryInactiveError extends ConflictError {
  constructor() {
    super("Category is inactive", "CATEGORY_INACTIVE");
  }
}

export class UserEmailAlreadyExistsError extends ConflictError {
  constructor() {
    super("User email already exists", "USER_EMAIL_ALREADY_EXISTS");
  }
}

export class InvalidTicketAssigneeError extends ConflictError {
  constructor(message: string) {
    super(message, "INVALID_TICKET_ASSIGNEE");
  }
}
