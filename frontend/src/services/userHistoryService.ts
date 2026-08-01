import {
  createUserHistoryRepository,
  findUserHistoryByUserId,
} from "../repositories/userHistoryRepository";

import type {
  UserHistoryAction,
  UserHistoryEntry,
} from "../types/UserHistory";

interface CreateUserHistoryData {
  userId: number;
  action: UserHistoryAction;
  title: string;
  description: string;
  performedBy?: string;
  createdAt?: string;
}

export function createUserHistory(
  historyData: CreateUserHistoryData
): UserHistoryEntry {
  return createUserHistoryRepository({
    userId: historyData.userId,
    action: historyData.action,
    title: historyData.title,
    description:
      historyData.description,
    performedBy:
      historyData.performedBy ??
      "Sistema",
    createdAt:
      historyData.createdAt ??
      new Date().toISOString(),
  });
}

export function getUserHistory(
  userId: number,
  userCreatedAt: string
): UserHistoryEntry[] {
  const currentHistory =
    findUserHistoryByUserId(userId);

  const hasCreatedEntry =
    currentHistory.some(
      (entry) =>
        entry.action === "created"
    );

  if (!hasCreatedEntry) {
    createUserHistory({
      userId,
      action: "created",
      title: "Usuário criado",
      description:
        "O cadastro do usuário foi criado no sistema.",
      performedBy: "Sistema",
      createdAt: userCreatedAt,
    });
  }

  return findUserHistoryByUserId(
    userId
  );
}