import type {
  TicketHistoryEntry,
  TicketHistoryEventType,
} from "../types/TicketHistory";

const STORAGE_KEY =
  "supportdesk-pro-ticket-history";

export interface CreateTicketHistoryEntryData {
  ticketId: number;

  eventType:
    TicketHistoryEventType;

  description:
    string;
}

function saveHistoryToStorage(
  historyToSave:
    TicketHistoryEntry[]
): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        historyToSave
      )
    );
  } catch (error) {
    console.error(
      "Não foi possível salvar o histórico dos chamados no Local Storage.",
      error
    );
  }
}

function loadHistoryFromStorage():
  TicketHistoryEntry[] {
  try {
    const storedHistory =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!storedHistory) {
      return [];
    }

    const parsedData:
      unknown =
      JSON.parse(
        storedHistory
      );

    if (
      !Array.isArray(
        parsedData
      )
    ) {
      return [];
    }

    return parsedData.filter(
      (
        entry
      ): entry is TicketHistoryEntry =>
        typeof entry ===
          "object" &&
        entry !== null &&
        typeof entry.id ===
          "number" &&
        typeof entry.ticketId ===
          "number" &&
        typeof entry.eventType ===
          "string" &&
        typeof entry.description ===
          "string" &&
        typeof entry.createdAt ===
          "string"
    );
  } catch (error) {
    console.error(
      "Não foi possível carregar o histórico dos chamados do Local Storage.",
      error
    );

    return [];
  }
}

let historyEntries:
  TicketHistoryEntry[] =
  loadHistoryFromStorage();

function sortHistoryByDate(
  entries:
    TicketHistoryEntry[]
): TicketHistoryEntry[] {
  return [
    ...entries,
  ].sort(
    (
      firstEntry,
      secondEntry
    ) => {
      const firstDate =
        new Date(
          firstEntry.createdAt
        ).getTime();

      const secondDate =
        new Date(
          secondEntry.createdAt
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
          secondEntry.id -
          firstEntry.id
        );
      }

      return (
        secondDate -
        firstDate
      );
    }
  );
}

export function findAllTicketHistoryEntries():
  TicketHistoryEntry[] {
  return sortHistoryByDate(
    historyEntries
  );
}

export function findHistoryByTicketId(
  ticketId: number
): TicketHistoryEntry[] {
  return sortHistoryByDate(
    historyEntries.filter(
      (entry) =>
        entry.ticketId ===
        ticketId
    )
  );
}

export function createTicketHistoryEntryRepository(
  historyData:
    CreateTicketHistoryEntryData
): TicketHistoryEntry {
  const highestId =
    historyEntries.reduce(
      (
        currentHighestId,
        entry
      ) =>
        Math.max(
          currentHighestId,
          entry.id
        ),
      0
    );

  const newEntry:
    TicketHistoryEntry = {
      ...historyData,

      id:
        highestId + 1,

      createdAt:
        new Date().toISOString(),
    };

  historyEntries = [
    ...historyEntries,
    newEntry,
  ];

  saveHistoryToStorage(
    historyEntries
  );

  return newEntry;
}

export function deleteHistoryByTicketId(
  ticketId: number
): void {
  historyEntries =
    historyEntries.filter(
      (entry) =>
        entry.ticketId !==
        ticketId
    );

  saveHistoryToStorage(
    historyEntries
  );
}