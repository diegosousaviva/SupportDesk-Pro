import type {
  TicketHistoryEntry,
  TicketHistoryEventType,
} from "../types/TicketHistory";

import {
  createTicketHistoryEntryRepository,
  deleteHistoryByTicketId,
  findAllTicketHistoryEntries,
  findHistoryByTicketId,
} from "../repositories/ticketHistoryRepository";

export interface CreateTicketHistoryEntryData {
  ticketId: number;

  eventType:
    TicketHistoryEventType;

  description:
    string;
}

export function getAllTicketHistory():
  TicketHistoryEntry[] {
  return findAllTicketHistoryEntries();
}

export function getTicketHistory(
  ticketId: number
): TicketHistoryEntry[] {
  return findHistoryByTicketId(
    ticketId
  );
}

export async function createTicketHistoryEntry(
  historyData:
    CreateTicketHistoryEntryData
): Promise<TicketHistoryEntry> {
  return createTicketHistoryEntryRepository(
    historyData
  );
}

export function deleteTicketHistory(
  ticketId: number
): void {
  deleteHistoryByTicketId(
    ticketId
  );
}
