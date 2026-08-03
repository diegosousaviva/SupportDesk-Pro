import type {
  CreateInventoryHistoryEventData,
  InventoryHistoryEvent,
} from "../types/InventoryHistory";

const STORAGE_KEY =
  "supportdesk-pro-inventory-history";

const initialHistoryEvents:
  InventoryHistoryEvent[] = [];

function saveHistoryEvents(
  events: InventoryHistoryEvent[]
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(events)
  );
}

function loadHistoryEvents():
  InventoryHistoryEvent[] {
  const storedEvents =
    localStorage.getItem(
      STORAGE_KEY
    );

  if (!storedEvents) {
    saveHistoryEvents(
      initialHistoryEvents
    );

    return initialHistoryEvents;
  }

  try {
    const parsedEvents =
      JSON.parse(
        storedEvents
      ) as unknown;

    if (
      !Array.isArray(
        parsedEvents
      )
    ) {
      saveHistoryEvents(
        initialHistoryEvents
      );

      return initialHistoryEvents;
    }

    return parsedEvents as
      InventoryHistoryEvent[];
  } catch (error) {
    console.error(
      "Não foi possível carregar o histórico do inventário.",
      error
    );

    saveHistoryEvents(
      initialHistoryEvents
    );

    return initialHistoryEvents;
  }
}

export function findAllInventoryHistoryEvents():
  InventoryHistoryEvent[] {
  return loadHistoryEvents();
}

export function findInventoryHistoryEventById(
  eventId: number
): InventoryHistoryEvent | undefined {
  return loadHistoryEvents().find(
    (event) =>
      event.id === eventId
  );
}

export function findInventoryHistoryByItemId(
  inventoryItemId: number
): InventoryHistoryEvent[] {
  return loadHistoryEvents()
    .filter(
      (event) =>
        event.inventoryItemId ===
        inventoryItemId
    )
    .sort(
      (
        firstEvent,
        secondEvent
      ) =>
        new Date(
          secondEvent.createdAt
        ).getTime() -
        new Date(
          firstEvent.createdAt
        ).getTime()
    );
}

export function createInventoryHistoryEvent(
  eventData:
    CreateInventoryHistoryEventData
): InventoryHistoryEvent {
  const events =
    loadHistoryEvents();

  const highestId =
    events.reduce(
      (
        currentHighestId,
        event
      ) =>
        Math.max(
          currentHighestId,
          event.id
        ),
      0
    );

  const newEvent:
    InventoryHistoryEvent = {
      id:
        highestId + 1,

      inventoryItemId:
        eventData.inventoryItemId,

      type:
        eventData.type,

      title:
        eventData.title,

      description:
        eventData.description,

      performedByUserId:
        eventData.performedByUserId,

      createdAt:
        new Date().toISOString(),
    };

  saveHistoryEvents([
    ...events,
    newEvent,
  ]);

  return newEvent;
}

export function deleteInventoryHistoryByItemId(
  inventoryItemId: number
): void {
  const events =
    loadHistoryEvents();

  const remainingEvents =
    events.filter(
      (event) =>
        event.inventoryItemId !==
        inventoryItemId
    );

  saveHistoryEvents(
    remainingEvents
  );
}