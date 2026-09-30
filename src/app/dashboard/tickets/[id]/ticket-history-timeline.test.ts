import { describe, expect, it } from "vitest";

import { TicketHistoryAction } from "@/modules/tickets/domain/ticket-history-action";

import { formatTicketHistoryDescription } from "./ticket-history-timeline";

describe("formatTicketHistoryDescription", () => {
  it.each([
    {
      action: TicketHistoryAction.TICKET_CREATED,
      oldValueLabel: null,
      newValueLabel: null,
      expected: "Ticket créé",
    },
    {
      action: TicketHistoryAction.PRIORITY_CHANGED,
      oldValueLabel: "MEDIUM",
      newValueLabel: "HIGH",
      expected: "Priorité MEDIUM → HIGH",
    },
    {
      action: TicketHistoryAction.ASSIGNED,
      oldValueLabel: null,
      newValueLabel: "Marc",
      expected: "Assigné à Marc",
    },
    {
      action: TicketHistoryAction.STATUS_CHANGED,
      oldValueLabel: "ASSIGNED",
      newValueLabel: "IN_PROGRESS",
      expected: "ASSIGNED → IN_PROGRESS",
    },
    {
      action: TicketHistoryAction.CATEGORY_CHANGED,
      oldValueLabel: "Matériel",
      newValueLabel: "Réseau",
      expected: "Catégorie Matériel → Réseau",
    },
    {
      action: TicketHistoryAction.COMMENT_ADDED,
      oldValueLabel: null,
      newValueLabel: "Pièce commandée",
      expected: "Commentaire ajouté",
    },
  ] satisfies Array<{
    action: TicketHistoryAction;
    oldValueLabel: string | null;
    newValueLabel: string | null;
    expected: string;
  }>)(
    "formats $action",
    ({ action, oldValueLabel, newValueLabel, expected }) => {
      expect(
        formatTicketHistoryDescription({
          action,
          oldValueLabel,
          newValueLabel,
        }),
      ).toBe(expected);
    },
  );
});
