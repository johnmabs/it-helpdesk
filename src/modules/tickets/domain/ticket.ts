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
      "status" | "assignedToId" | "updatedAt" | "resolvedAt" | "closedAt"
    >,
  ): Ticket {
    const title = props.title.trim();
    const description = props.description.trim();

    if (!title) {
      throw new Error("Ticket title is required");
    }

    if (!description) {
      throw new Error("Ticket description is required");
    }

    return new Ticket({
      ...props,
      title,
      description,
      status: TicketStatus.OPEN,
      assignedToId: null,
      updatedAt: props.createdAt,
      resolvedAt: null,
      closedAt: null,
    });
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
