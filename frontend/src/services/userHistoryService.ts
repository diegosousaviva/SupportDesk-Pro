import { createData, listData } from "./dataApi";
import { replaceUserHistoryCache, upsertUserHistoryCache } from "../repositories/userHistoryRepository";
import type { UserHistoryAction, UserHistoryEntry } from "../types/UserHistory";

interface CreateUserHistoryData {
  userId: number;
  action: UserHistoryAction;
  title: string;
  description: string;
  performedBy?: string;
  createdAt?: string;
}

export async function createUserHistory(data: CreateUserHistoryData): Promise<UserHistoryEntry> {
  const created = await createData<UserHistoryEntry>("user-history", {
    userId: data.userId,
    action: data.action,
    title: data.title,
    description: data.description,
  });
  upsertUserHistoryCache(created);
  return created;
}

export async function getUserHistory(userId: number): Promise<UserHistoryEntry[]> {
  const entries = await listData<UserHistoryEntry>("user-history");
  replaceUserHistoryCache(entries);
  return entries
    .filter((entry) => entry.userId === userId)
    .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt));
}
