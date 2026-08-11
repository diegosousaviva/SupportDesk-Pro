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

export function createTicketHistoryEntry(
  historyData:
    CreateTicketHistoryEntryData
): TicketHistoryEntry {
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