import { TicketHistoryAction } from "./ticket-history-action";

export type TicketHistoryProps = {
  id: string;
  ticketId: string;
  actorId: string;
  action: TicketHistoryAction;
  oldValue: string | null;
  newValue: string | null;
  createdAt: Date;
};

export type CreateTicketHistoryProps = Omit<
  TicketHistoryProps,
  "oldValue" | "newValue"
> & {
  oldValue?: string | null;
  newValue?: string | null;
};

export class TicketHistory {
  private constructor(private readonly props: TicketHistoryProps) {}

  static create(props: CreateTicketHistoryProps): TicketHistory {
    return new TicketHistory({
      ...props,
      oldValue: props.oldValue ?? null,
      newValue: props.newValue ?? null,
    });
  }

  static restore(props: TicketHistoryProps): TicketHistory {
    return new TicketHistory(props);
  }

  get id(): string {
    return this.props.id;
  }

  get ticketId(): string {
    return this.props.ticketId;
  }

  get actorId(): string {
    return this.props.actorId;
  }

  get action(): TicketHistoryAction {
    return this.props.action;
  }

  get oldValue(): string | null {
    return this.props.oldValue;
  }

  get newValue(): string | null {
    return this.props.newValue;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
