import {
  createInventoryHistoryEvent as createInventoryHistoryEventRepository,
  deleteInventoryHistoryByItemId,
  findAllInventoryHistoryEvents,
  findInventoryHistoryByItemId,
} from "../repositories/inventoryHistoryRepository";

import {
  getInventoryItemById,
} from "./inventoryService";

import {
  getUserById,
} from "./userService";

import type {
  CreateInventoryHistoryEventData,
  InventoryHistoryEvent,
} from "../types/InventoryHistory";

function normalizeText(
  value: string
): string {
  return value.trim();
}

function validateInventoryItem(
  inventoryItemId: number
): void {
  const inventoryItem =
    getInventoryItemById(
      inventoryItemId
    );

  if (!inventoryItem) {
    throw new Error(
      "O equipamento informado não foi encontrado."
    );
  }
}

function validatePerformedByUser(
  performedByUserId:
    number | null
): void {
  if (
    performedByUserId ===
    null
  ) {
    return;
  }

  const user =
    getUserById(
      performedByUserId
    );

  if (!user) {
    throw new Error(
      "O usuário responsável pela ação não foi encontrado."
    );
  }
}

function sortHistoryByDate(
  events:
    InventoryHistoryEvent[]
): InventoryHistoryEvent[] {
  return [
    ...events,
  ].sort(
    (
      firstEvent,
      secondEvent
    ) => {
      const firstDate =
        new Date(
          firstEvent.createdAt
        ).getTime();

      const secondDate =
        new Date(
          secondEvent.createdAt
        ).getTime();

      if (
        Number.isNaN(
          firstDate
        ) ||
        Number.isNaN(
          secondDate
        )
      ) {
        return (
          secondEvent.id -
          firstEvent.id
        );
      }

      return (
        secondDate -
        firstDate
      );
    }
  );
}

export function getAllInventoryHistory():
  InventoryHistoryEvent[] {
  return sortHistoryByDate(
    findAllInventoryHistoryEvents()
  );
}

export function getInventoryHistory(
  inventoryItemId: number
): InventoryHistoryEvent[] {
  if (
    !Number.isInteger(
      inventoryItemId
    ) ||
    inventoryItemId <= 0
  ) {
    return [];
  }

  return sortHistoryByDate(
    findInventoryHistoryByItemId(
      inventoryItemId
    )
  );
}

export function addInventoryHistoryEvent(
  eventData:
    CreateInventoryHistoryEventData
): InventoryHistoryEvent {
  validateInventoryItem(
    eventData.inventoryItemId
  );

  validatePerformedByUser(
    eventData.performedByUserId
  );

  const title =
    normalizeText(
      eventData.title
    );

  const description =
    normalizeText(
      eventData.description
    );

  if (!title) {
    throw new Error(
      "Informe o título do evento."
    );
  }

  if (
    title.length >
    120
  ) {
    throw new Error(
      "O título do evento deve possuir no máximo 120 caracteres."
    );
  }

  if (
    description.length >
    1000
  ) {
    throw new Error(
      "A descrição do evento deve possuir no máximo 1000 caracteres."
    );
  }

  return createInventoryHistoryEventRepository(
    {
      inventoryItemId:
        eventData.inventoryItemId,

      type:
        eventData.type,

      title,

      description,

      performedByUserId:
        eventData.performedByUserId,
    }
  );
}

export function removeInventoryHistory(
  inventoryItemId: number
): void {
  if (
    !Number.isInteger(
      inventoryItemId
    ) ||
    inventoryItemId <= 0
  ) {
    return;
  }

  deleteInventoryHistoryByItemId(
    inventoryItemId
  );
}