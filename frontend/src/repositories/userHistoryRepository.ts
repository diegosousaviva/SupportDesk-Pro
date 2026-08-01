import type {
  UserHistoryEntry,
} from "../types/UserHistory";

const STORAGE_KEY =
  "supportdesk-pro-user-history";

function saveHistory(
  history: UserHistoryEntry[]
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(history)
  );
}

function loadHistory(): UserHistoryEntry[] {
  const storedData =
    localStorage.getItem(STORAGE_KEY);

  if (!storedData) {
    return [];
  }

  try {
    const parsedHistory =
      JSON.parse(
        storedData
      ) as UserHistoryEntry[];

    if (!Array.isArray(parsedHistory)) {
      return [];
    }

    return parsedHistory;
  } catch {
    return [];
  }
}

export function findAllUserHistory(): UserHistoryEntry[] {
  return loadHistory();
}

export function findUserHistoryByUserId(
  userId: number
): UserHistoryEntry[] {
  return loadHistory()
    .filter(
      (entry) =>
        entry.userId === userId
    )
    .sort(
      (firstEntry, secondEntry) =>
        new Date(
          secondEntry.createdAt
        ).getTime() -
        new Date(
          firstEntry.createdAt
        ).getTime()
    );
}

export function createUserHistoryRepository(
  entry: Omit<
    UserHistoryEntry,
    "id"
  >
): UserHistoryEntry {
  const history = loadHistory();

  const nextId =
    history.length > 0
      ? Math.max(
          ...history.map(
            (currentEntry) =>
              currentEntry.id
          )
        ) + 1
      : 1;

  const newEntry: UserHistoryEntry = {
    id: nextId,
    ...entry,
  };

  history.push(newEntry);

  saveHistory(history);

  return newEntry;
}

export function deleteUserHistoryByUserId(
  userId: number
): void {
  const history = loadHistory();

  const filteredHistory =
    history.filter(
      (entry) =>
        entry.userId !== userId
    );

  saveHistory(filteredHistory);
}