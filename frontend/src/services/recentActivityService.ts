import {
  getAllInventoryHistory,
} from "./inventoryHistoryService";

import {
  getAllTicketHistory,
} from "./ticketHistoryService";

import {
  getInventoryItemById,
} from "./inventoryService";

import {
  getTicketById,
} from "./ticketService";

import {
  getUserById,
} from "./userService";

import type {
  DashboardPeriod,
  DashboardStoreFilter,
} from "../components/dashboard/DashboardFilters";

import type {
  InventoryHistoryEvent,
} from "../types/InventoryHistory";

import type {
  TicketHistoryEntry,
} from "../types/TicketHistory";

export type RecentActivitySource =
  | "Chamado"
  | "Inventário";

export interface RecentActivityItem {
  id:
    string;

  source:
    RecentActivitySource;

  referenceId:
    number;

  inventoryItemId:
    number | null;

  storeId:
    number | null;

  title:
    string;

  description:
    string;

  performedBy:
    string;

  performedByRole:
    string;

  createdAt:
    string;

  path:
    string;
}

export interface RecentActivityFilters {
  period?:
    DashboardPeriod;

  storeFilter?:
    DashboardStoreFilter;

  limit?:
    number;
}

function startOfDay(
  date: Date
): Date {
  const normalizedDate =
    new Date(
      date
    );

  normalizedDate.setHours(
    0,
    0,
    0,
    0
  );

  return normalizedDate;
}

function getPeriodStartDate(
  period: DashboardPeriod
): Date {
  const startDate =
    startOfDay(
      new Date()
    );

  switch (period) {
    case "today":
      return startDate;

    case "7_days":
      startDate.setDate(
        startDate.getDate() -
          6
      );

      return startDate;

    case "30_days":
      startDate.setDate(
        startDate.getDate() -
          29
      );

      return startDate;

    case "90_days":
      startDate.setDate(
        startDate.getDate() -
          89
      );

      return startDate;

    case "this_month":
      startDate.setDate(
        1
      );

      return startDate;

    case "this_year":
      startDate.setMonth(
        0,
        1
      );

      return startDate;
  }
}

function getSelectedStoreId(
  storeFilter:
    DashboardStoreFilter
): number | null {
  if (
    storeFilter ===
    "all"
  ) {
    return null;
  }

  const storeId =
    Number(
      storeFilter
    );

  if (
    !Number.isInteger(
      storeId
    ) ||
    storeId <= 0
  ) {
    return null;
  }

  return storeId;
}

function mapTicketHistoryEntry(
  entry: TicketHistoryEntry
): RecentActivityItem {
  const ticket =
    getTicketById(
      entry.ticketId
    );

  const inventoryItem =
    ticket?.inventoryItemId ===
      null ||
    ticket?.inventoryItemId ===
      undefined
      ? undefined
      : getInventoryItemById(
          ticket.inventoryItemId
        );

  return {
    id:
      `ticket-${entry.id}`,

    source:
      "Chamado",

    referenceId:
      entry.ticketId,

    inventoryItemId:
      ticket?.inventoryItemId ??
      null,

    storeId:
      inventoryItem?.storeId ??
      null,

    title:
      ticket
        ? `Chamado #${ticket.id} — ${ticket.title}`
        : `Chamado #${entry.ticketId}`,

    description:
      entry.description,

    performedBy:
      "Sistema",

    performedByRole:
      "Histórico do chamado",

    createdAt:
      entry.createdAt,

    path:
      `/tickets/${entry.ticketId}`,
  };
}

function mapInventoryHistoryEvent(
  event: InventoryHistoryEvent
): RecentActivityItem {
  const inventoryItem =
    getInventoryItemById(
      event.inventoryItemId
    );

  const user =
    event.performedByUserId ===
    null
      ? null
      : getUserById(
          event.performedByUserId
        );

  return {
    id:
      `inventory-${event.id}`,

    source:
      "Inventário",

    referenceId:
      event.inventoryItemId,

    inventoryItemId:
      event.inventoryItemId,

    storeId:
      inventoryItem?.storeId ??
      null,

    title:
      inventoryItem
        ? `${event.title} — ${inventoryItem.tag}`
        : event.title,

    description:
      event.description,

    performedBy:
      user?.name ??
      "Sistema",

    performedByRole:
      user?.role ??
      "Ação automática",

    createdAt:
      event.createdAt,

    path:
      `/inventory/${event.inventoryItemId}`,
  };
}

function sortActivitiesByDate(
  activities:
    RecentActivityItem[]
): RecentActivityItem[] {
  return [
    ...activities,
  ].sort(
    (
      firstActivity,
      secondActivity
    ) => {
      const firstDate =
        new Date(
          firstActivity.createdAt
        ).getTime();

      const secondDate =
        new Date(
          secondActivity.createdAt
        ).getTime();

      if (
        Number.isNaN(
          firstDate
        ) ||
        Number.isNaN(
          secondDate
        )
      ) {
        return 0;
      }

      return (
        secondDate -
        firstDate
      );
    }
  );
}

function filterActivitiesByPeriod(
  activities:
    RecentActivityItem[],
  period:
    DashboardPeriod
): RecentActivityItem[] {
  const startDate =
    getPeriodStartDate(
      period
    );

  return activities.filter(
    (activity) => {
      const activityDate =
        new Date(
          activity.createdAt
        );

      if (
        Number.isNaN(
          activityDate.getTime()
        )
      ) {
        return false;
      }

      return (
        activityDate >=
        startDate
      );
    }
  );
}

function filterActivitiesByStore(
  activities:
    RecentActivityItem[],
  storeFilter:
    DashboardStoreFilter
): RecentActivityItem[] {
  const selectedStoreId =
    getSelectedStoreId(
      storeFilter
    );

  if (
    selectedStoreId ===
    null
  ) {
    return activities;
  }

  return activities.filter(
    (activity) =>
      activity.storeId ===
      selectedStoreId
  );
}

export function getRecentActivities(
  filters:
    RecentActivityFilters = {}
): RecentActivityItem[] {
  const {
    period =
      "30_days",

    storeFilter =
      "all",

    limit =
      10,
  } = filters;

  const ticketActivities =
    getAllTicketHistory().map(
      mapTicketHistoryEntry
    );

  const inventoryActivities =
    getAllInventoryHistory().map(
      mapInventoryHistoryEvent
    );

  const allActivities =
    sortActivitiesByDate([
      ...ticketActivities,
      ...inventoryActivities,
    ]);

  const periodFilteredActivities =
    filterActivitiesByPeriod(
      allActivities,
      period
    );

  const storeFilteredActivities =
    filterActivitiesByStore(
      periodFilteredActivities,
      storeFilter
    );

  if (
    !Number.isInteger(
      limit
    ) ||
    limit <= 0
  ) {
    return [];
  }

  return storeFilteredActivities.slice(
    0,
    limit
  );
}