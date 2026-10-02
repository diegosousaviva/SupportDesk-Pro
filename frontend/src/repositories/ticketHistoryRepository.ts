import type { TicketHistoryEntry } from "../types/TicketHistory";
import { createData, listData } from "../services/dataApi";

export interface CreateTicketHistoryEntryData {
  ticketId: number;
  eventType: TicketHistoryEntry["eventType"];
  description: string;
}
let entries: TicketHistoryEntry[] = [];

export async function refreshTicketHistory(): Promise<TicketHistoryEntry[]> {
  entries = await listData<TicketHistoryEntry>("ticket-history");
  return [...entries];
}
function sortByDate(rows: TicketHistoryEntry[]): TicketHistoryEntry[] {
  return [...rows].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
export function findAllTicketHistoryEntries(): TicketHistoryEntry[] { return sortByDate(entries); }
export function findHistoryByTicketId(ticketId: number): TicketHistoryEntry[] {
  return sortByDate(entries.filter((entry) => entry.ticketId === ticketId));
}
export async function createTicketHistoryEntryRepository(data: CreateTicketHistoryEntryData): Promise<TicketHistoryEntry> {
  const entry = await createData<TicketHistoryEntry>("ticket-history", data);
  entries = [entry, ...entries];
  return entry;
}
export function deleteHistoryByTicketId(ticketId: number): void {
  entries = entries.filter((entry) => entry.ticketId !== ticketId);
}
