import { TicketPriority } from "./ticket-priority";
import { TicketStatus } from "./ticket-status";

export type TicketProps = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdById: string;
  assignedToId: string | null;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  closedAt: Date | null;
};

export class Ticket {
  private constructor(private readonly props: TicketProps) {}

  static create(
    props: Omit<
      TicketProps,
      | "status"
      | "assignedToId"
      | "categoryId"
      | "updatedAt"
      | "resolvedAt"
      | "closedAt"
    > & { categoryId: string },
  ): Ticket {
    const title = props.title.trim();
    const description = props.description.trim();
    const categoryId = props.categoryId.trim();

    if (!title) {
      throw new Error("Ticket title is required");
    }

    if (!description) {
      throw new Error("Ticket description is required");
    }

    if (!categoryId) {
      throw new Error("Ticket category is required");
    }

    return new Ticket({
      ...props,
      title,
      description,
      status: TicketStatus.OPEN,
      assignedToId: null,
      categoryId,
      updatedAt: props.createdAt,
      resolvedAt: null,
      closedAt: null,
    });
  }

  static restore(props: TicketProps): Ticket {
    return new Ticket(props);
  }

  assignTo(technicianId: string, now: Date): void {
    if (this.props.status !== TicketStatus.OPEN) {
      throw new Error("Only open tickets can be assigned");
    }

    this.props.assignedToId = technicianId;
    this.props.status = TicketStatus.ASSIGNED;
    this.props.updatedAt = now;
  }

  start(now: Date): void {
    if (this.props.status !== TicketStatus.ASSIGNED) {
      throw new Error("Only assigned tickets can be started");
    }

    this.props.status = TicketStatus.IN_PROGRESS;
    this.props.updatedAt = now;
  }

  resolve(now: Date): void {
    if (this.props.status !== TicketStatus.IN_PROGRESS) {
      throw new Error("Only tickets in progress can be resolved");
    }

    this.props.status = TicketStatus.RESOLVED;
    this.props.resolvedAt = now;
    this.props.updatedAt = now;
  }

  close(now: Date): void {
    if (this.props.status !== TicketStatus.RESOLVED) {
      throw new Error("Only resolved tickets can be closed");
    }

    this.props.status = TicketStatus.CLOSED;
    this.props.closedAt = now;
    this.props.updatedAt = now;
  }

  cancel(now: Date): void {
    if (
      this.props.status === TicketStatus.CLOSED ||
      this.props.status === TicketStatus.CANCELLED
    ) {
      throw new Error("Closed or cancelled tickets cannot be cancelled");
    }

    this.props.status = TicketStatus.CANCELLED;
    this.props.updatedAt = now;
  }

  changePriority(priority: TicketPriority, now: Date): void {
    if (
      this.props.status === TicketStatus.CLOSED ||
      this.props.status === TicketStatus.CANCELLED
    ) {
      throw new Error("Closed or cancelled tickets cannot be updated");
    }

    this.props.priority = priority;
    this.props.updatedAt = now;
  }

  changeCategory(categoryId: string, now: Date): void {
    if (
      this.props.status === TicketStatus.CLOSED ||
      this.props.status === TicketStatus.CANCELLED
    ) {
      throw new Error("Closed or cancelled tickets cannot be updated");
    }

    const normalizedCategoryId = categoryId.trim();

    if (!normalizedCategoryId) {
      throw new Error("Ticket category is required");
    }

    this.props.categoryId = normalizedCategoryId;
    this.props.updatedAt = now;
  }

  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get status(): TicketStatus {
    return this.props.status;
  }

  get priority(): TicketPriority {
    return this.props.priority;
  }

  get createdById(): string {
    return this.props.createdById;
  }

  get assignedToId(): string | null {
    return this.props.assignedToId;
  }

  get categoryId(): string | null {
    return this.props.categoryId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get resolvedAt(): Date | null {
    return this.props.resolvedAt;
  }

  get closedAt(): Date | null {
    return this.props.closedAt;
  }
}
