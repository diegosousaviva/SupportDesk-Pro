import type { InventoryItem } from "../types/InventoryItem";
import { createData, deleteData, listData, updateData } from "../services/dataApi";

type InventoryInput = Omit<InventoryItem, "id" | "createdAt" | "updatedAt">;
let items: InventoryItem[] = [];

export async function refreshInventoryItems(): Promise<InventoryItem[]> {
  items = await listData<InventoryItem>("inventory");
  return [...items];
}
export function findAllInventoryItems(): InventoryItem[] { return [...items]; }
export function findInventoryItemById(id: number): InventoryItem | undefined { return items.find((item) => item.id === id); }
export function findInventoryItemByTag(tag: string): InventoryItem | undefined {
  const value = tag.trim().toLocaleLowerCase("pt-BR");
  return items.find((item) => item.tag.trim().toLocaleLowerCase("pt-BR") === value);
}
export function findInventoryItemByAssetNumber(assetNumber: string): InventoryItem | undefined {
  const value = assetNumber.trim().toLocaleLowerCase("pt-BR");
  return value ? items.find((item) => item.assetNumber.trim().toLocaleLowerCase("pt-BR") === value) : undefined;
}
export async function createInventoryItem(data: InventoryInput): Promise<InventoryItem> {
  const item = await createData<InventoryItem>("inventory", data);
  items = [item, ...items];
  return item;
}
export async function updateInventoryItemById(id: number, data: Partial<InventoryInput>): Promise<InventoryItem | undefined> {
  const item = await updateData<InventoryItem>("inventory", id, data);
  items = items.map((current) => current.id === id ? item : current);
  return item;
}
export async function deleteInventoryItemById(id: number): Promise<boolean> {
  await deleteData("inventory", id);
  items = items.filter((item) => item.id !== id);
  return true;
}
export function getNextAutomaticTag(): string {
  const highest = items.reduce((max, item) => {
    const match = /^TI-(\d+)$/i.exec(item.tag.trim());
    return item.tagMode === "Automática" && match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `TI-${String(highest + 1).padStart(6, "0")}`;
}
