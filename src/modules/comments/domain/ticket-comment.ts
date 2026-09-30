import { ValidationError } from "@/shared/errors/application-error";

export type TicketCommentProps = {
  id: string;
  ticketId: string;
  authorId: string;
  body: string;
  createdAt: Date;
  updatedAt: Date | null;
};

export class TicketComment {
  private constructor(private readonly props: TicketCommentProps) {}

  static create(
    props: Omit<TicketCommentProps, "updatedAt">,
  ): TicketComment {
    return new TicketComment({
      ...props,
      body: TicketComment.normalizeBody(props.body),
      updatedAt: null,
    });
  }

  static restore(props: TicketCommentProps): TicketComment {
    return new TicketComment(props);
  }

  updateBody(body: string, updatedAt: Date): void {
    this.props.body = TicketComment.normalizeBody(body);
    this.props.updatedAt = updatedAt;
  }

  get id(): string {
    return this.props.id;
  }

  get ticketId(): string {
    return this.props.ticketId;
  }

  get authorId(): string {
    return this.props.authorId;
  }

  get body(): string {
    return this.props.body;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date | null {
    return this.props.updatedAt;
  }

  private static normalizeBody(body: string): string {
    const normalizedBody = body.trim();

    if (!normalizedBody) {
      throw new ValidationError("Comment body is required");
    }

    return normalizedBody;
  }
}
