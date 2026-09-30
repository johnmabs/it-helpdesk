import { IdGenerator } from "@/shared/identity/id-generator";

import { TicketHistoryAction } from "../domain/ticket-history-action";
import { TicketHistoryRepository } from "../domain/ticket-history-repository";
import { TicketHistory } from "../domain/ticket-history";

export type RecordTicketHistoryInput = {
  ticketId: string;
  actorId: string;
  action: TicketHistoryAction;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: Date;
};

export class TicketHistoryRecorder {
  constructor(
    private readonly history: TicketHistoryRepository,
    private readonly idGenerator: IdGenerator,
  ) {}

  async record(input: RecordTicketHistoryInput): Promise<void> {
    await this.history.save(
      TicketHistory.create({
        id: this.idGenerator.generate(),
        ...input,
      }),
    );
  }
}
