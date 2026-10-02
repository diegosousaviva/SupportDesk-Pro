import type { CreateInventoryHistoryEventData, InventoryHistoryEvent } from "../types/InventoryHistory";
import { createData, deleteData, listData } from "../services/dataApi";

let events: InventoryHistoryEvent[] = [];
export async function refreshInventoryHistory(): Promise<InventoryHistoryEvent[]> {
  events = await listData<InventoryHistoryEvent>("inventory-history");
  return [...events];
}
export function findAllInventoryHistoryEvents(): InventoryHistoryEvent[] { return [...events]; }
export function findInventoryHistoryEventById(id: number): InventoryHistoryEvent | undefined { return events.find((event) => event.id === id); }
export function findInventoryHistoryByItemId(itemId: number): InventoryHistoryEvent[] {
  return events.filter((event) => event.inventoryItemId === itemId).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
export async function createInventoryHistoryEvent(data: CreateInventoryHistoryEventData): Promise<InventoryHistoryEvent> {
  const event = await createData<InventoryHistoryEvent>("inventory-history", data);
  events = [event, ...events];
  return event;
}
export async function deleteInventoryHistoryByItemId(itemId: number): Promise<void> {
  const matching = events.filter((event) => event.inventoryItemId === itemId);
  await Promise.all(matching.map((event) => deleteData("inventory-history", event.id)));
  events = events.filter((event) => event.inventoryItemId !== itemId);
}
