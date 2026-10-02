import type { UserHistoryEntry } from "../types/UserHistory";

let historyCache: UserHistoryEntry[] = [];

export function replaceUserHistoryCache(entries: UserHistoryEntry[]): void {
  historyCache = [...entries];
}

export function upsertUserHistoryCache(entry: UserHistoryEntry): void {
  historyCache = [...historyCache.filter((current) => current.id !== entry.id), entry];
}

export function clearUserHistoryCache(): void {
  historyCache = [];
}

export function findAllUserHistory(): UserHistoryEntry[] {
  return [...historyCache];
}

export function findUserHistoryByUserId(userId: number): UserHistoryEntry[] {
  return historyCache
    .filter((entry) => entry.userId === userId)
    .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt));
}
