import { createContext } from "react";
import type { AppNotification, NotificationType } from "../types/Notification";

export type CreateNotificationData = Omit<AppNotification, "id" | "createdAt">;

export interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: CreateNotificationData) => Promise<AppNotification | undefined>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (notificationId: number) => Promise<void>;
  removeNotificationsByTicket: (ticketId: number) => Promise<void>;
  removeNotificationsByTicketAndTypes: (ticketId: number, types: readonly NotificationType[]) => Promise<void>;
  removeSlaNotificationsByTicket: (ticketId: number) => Promise<void>;
  clearNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);
