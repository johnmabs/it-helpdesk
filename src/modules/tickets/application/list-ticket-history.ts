import { TicketHistoryAction } from "@/modules/tickets/domain/ticket-history-action";
import { prisma } from "@/shared/database/prisma";

export type TicketHistoryListItem = {
  id: string;
  action: TicketHistoryAction;
  oldValue: string | null;
  newValue: string | null;
  oldValueLabel: string | null;
  newValueLabel: string | null;
  createdAt: Date;
  actorName: string;
};

export async function listTicketHistory(
  ticketId: string,
): Promise<TicketHistoryListItem[]> {
  const entries = await prisma.ticketHistory.findMany({
    where: { ticketId },
    select: {
      id: true,
      action: true,
      oldValue: true,
      newValue: true,
      createdAt: true,
      actor: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });

  const assignmentIds = referencedValues(
    entries,
    TicketHistoryAction.ASSIGNED,
  );
  const categoryIds = referencedValues(
    entries,
    TicketHistoryAction.CATEGORY_CHANGED,
  );

  const [users, categories] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: assignmentIds } },
      select: { id: true, name: true },
    }),
    prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    }),
  ]);

  const userNames = new Map(users.map((user) => [user.id, user.name]));
  const categoryNames = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  return entries.map((entry) => {
    const action = TicketHistoryAction[entry.action];
    const labels = labelsForAction(
      action,
      entry.oldValue,
      entry.newValue,
      userNames,
      categoryNames,
    );

    return {
      id: entry.id,
      action,
      oldValue: entry.oldValue,
      newValue: entry.newValue,
      oldValueLabel: labels.oldValue,
      newValueLabel: labels.newValue,
      createdAt: entry.createdAt,
      actorName: entry.actor.name,
    };
  });
}

type HistoryReference = {
  action: string;
  oldValue: string | null;
  newValue: string | null;
};

function referencedValues(
  entries: HistoryReference[],
  action: TicketHistoryAction,
): string[] {
  return [
    ...new Set(
      entries
        .filter((entry) => entry.action === action)
        .flatMap((entry) => [entry.oldValue, entry.newValue])
        .filter((value): value is string => value !== null),
    ),
  ];
}

function labelsForAction(
  action: TicketHistoryAction,
  oldValue: string | null,
  newValue: string | null,
  userNames: Map<string, string>,
  categoryNames: Map<string, string>,
): { oldValue: string | null; newValue: string | null } {
  if (action === TicketHistoryAction.ASSIGNED) {
    return {
      oldValue: labelReference(oldValue, userNames),
      newValue: labelReference(newValue, userNames),
    };
  }

  if (action === TicketHistoryAction.CATEGORY_CHANGED) {
    return {
      oldValue: labelReference(oldValue, categoryNames),
      newValue: labelReference(newValue, categoryNames),
    };
  }

  return { oldValue, newValue };
}

function labelReference(
  value: string | null,
  labels: Map<string, string>,
): string | null {
  return value ? (labels.get(value) ?? value) : null;
}
