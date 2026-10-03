import type {
  InventoryItem,
} from "../types/InventoryItem";

import type {
  Store,
} from "../types/Store";

import type {
  Ticket,
} from "../types/Ticket";

import {
  calculateSlaSummary,
} from "./slaService";

export interface StoreReportItem {
  storeId:
    number | null;

  storeCode:
    string;

  storeName:
    string;

  totalTickets:
    number;

  openTickets:
    number;

  inProgressTickets:
    number;

  resolvedTickets:
    number;

  criticalTickets:
    number;

  resolutionRate:
    number;

  slaCompliance:
    number;
}

function getStoreInfo(
  ticket:
    Ticket,
  inventoryItems:
    InventoryItem[],
  stores:
    Store[]
): {
  storeId:
    number | null;

  storeCode:
    string;

  storeName:
    string;
} {
  const inventoryItem =
    ticket.inventoryItemId === null
      ? undefined
      : inventoryItems.find(
          (item) => item.id === ticket.inventoryItemId
        );

  // The ticket's store is authoritative. Older tickets may only have a store
  // indirectly through their linked inventory item, so retain that fallback.
  const storeId = ticket.storeId ?? inventoryItem?.storeId ?? null;

  if (storeId === null) {
    return {
      storeId:
        null,

      storeCode:
        "-",

      storeName:
        "Sem loja vinculada",
    };
  }

  const store =
    stores.find(
      (currentStore) =>
        currentStore.id ===
        storeId
    );

  if (!store) {
    return {
      storeId:
        storeId,

      storeCode:
        String(
          storeId
        ),

      storeName:
        "Loja não encontrada",
    };
  }

  return {
    storeId:
      store.id,

    storeCode:
      store.code,

    storeName:
      store.status ===
      "Inativa"
        ? `${store.name} — Inativa`
        : store.name,
  };
}

export function createStoreReport(
  tickets:
    Ticket[],
  inventoryItems:
    InventoryItem[],
  stores:
    Store[]
): StoreReportItem[] {
  const storeMap =
    new Map<
      string,
      {
        storeId:
          number | null;

        storeCode:
          string;

        storeName:
          string;

        tickets:
          Ticket[];
      }
    >();

  tickets.forEach(
    (ticket) => {
      const storeInfo =
        getStoreInfo(
          ticket,
          inventoryItems,
          stores
        );

      const key =
        storeInfo.storeId ===
        null
          ? "unlinked"
          : String(
              storeInfo.storeId
            );

      const currentData =
        storeMap.get(
          key
        ) ?? {
          storeId:
            storeInfo.storeId,

          storeCode:
            storeInfo.storeCode,

          storeName:
            storeInfo.storeName,

          tickets:
            [],
        };

      currentData.tickets.push(
        ticket
      );

      storeMap.set(
        key,
        currentData
      );
    }
  );

  return Array.from(
    storeMap.values()
  )
    .map(
      (storeData) => {
        const storeTickets =
          storeData.tickets;

        const totalTickets =
          storeTickets.length;

        const openTickets =
          storeTickets.filter(
            (ticket) =>
              ticket.status ===
              "Aberto"
          ).length;

        const inProgressTickets =
          storeTickets.filter(
            (ticket) =>
              ticket.status ===
              "Em andamento"
          ).length;

        const resolvedTickets =
          storeTickets.filter(
            (ticket) =>
              ticket.status ===
              "Resolvido"
          ).length;

        const criticalTickets =
          storeTickets.filter(
            (ticket) =>
              ticket.priority ===
              "Crítica"
          ).length;

        const resolutionRate =
          totalTickets ===
          0
            ? 0
            : Math.round(
                (
                  resolvedTickets /
                  totalTickets
                ) * 100
              );

        const slaSummary =
          calculateSlaSummary(
            storeTickets
          );

        return {
          storeId:
            storeData.storeId,

          storeCode:
            storeData.storeCode,

          storeName:
            storeData.storeName,

          totalTickets,

          openTickets,

          inProgressTickets,

          resolvedTickets,

          criticalTickets,

          resolutionRate,

          slaCompliance:
            slaSummary.compliancePercentage,
        };
      }
    )
    .sort(
      (
        firstItem,
        secondItem
      ) => {
        if (
          firstItem.totalTickets !==
          secondItem.totalTickets
        ) {
          return (
            secondItem.totalTickets -
            firstItem.totalTickets
          );
        }

        return firstItem.storeName.localeCompare(
          secondItem.storeName,
          "pt-BR"
        );
      }
    );
}
