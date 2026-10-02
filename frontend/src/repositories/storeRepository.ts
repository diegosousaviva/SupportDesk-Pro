import type { Store } from "../types/Store";
import { createData, deleteData, listData, updateData } from "../services/dataApi";

type StoreInput = Omit<Store, "id" | "createdAt" | "updatedAt">;
let storeCache: Store[] = [];

export async function refreshStores(): Promise<Store[]> {
  storeCache = await listData<Store>("stores");
  return [...storeCache];
}

export function findAllStores(): Store[] { return [...storeCache]; }
export function findStoreById(id: number): Store | undefined { return storeCache.find((store) => store.id === id); }
export function findStoreByCode(code: string): Store | undefined {
  const normalized = code.trim().toLocaleLowerCase("pt-BR");
  return storeCache.find((store) => store.code.trim().toLocaleLowerCase("pt-BR") === normalized);
}

export async function createStore(data: StoreInput): Promise<Store> {
  const record = await createData<Store>("stores", data);
  storeCache = [...storeCache, record];
  return record;
}

export async function updateStoreById(id: number, data: Partial<StoreInput>): Promise<Store | undefined> {
  const record = await updateData<Store>("stores", id, data);
  storeCache = storeCache.map((store) => store.id === id ? record : store);
  return record;
}

export async function deleteStoreById(id: number): Promise<boolean> {
  await deleteData("stores", id);
  storeCache = storeCache.filter((store) => store.id !== id);
  return true;
}
