export type UserHistoryAction =
  | "created"
  | "updated"
  | "role_changed"
  | "activated"
  | "deactivated"
  | "deleted";

export interface UserHistoryEntry {
  id: number;
  userId: number;
  action: UserHistoryAction;
  title: string;
  description: string;
  performedBy: string;
  createdAt: string;
}