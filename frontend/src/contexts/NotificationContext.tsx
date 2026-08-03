import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  addNotification as addNotificationService,
  clearNotifications as clearNotificationsService,
  getNotifications,
  markAllNotificationsAsRead as markAllNotificationsAsReadService,
  markNotificationAsRead as markNotificationAsReadService,
  removeNotification as removeNotificationService,
  removeNotificationsByTicket as removeNotificationsByTicketService,
  removeNotificationsByTicketAndTypes as removeNotificationsByTicketAndTypesService,
  removeSlaNotificationsByTicket as removeSlaNotificationsByTicketService,
} from "../services/notificationService";

import type {
  AppNotification,
  NotificationType,
} from "../types/Notification";

export type CreateNotificationData = Omit<
  AppNotification,
  "id" | "createdAt"
>;

interface NotificationContextValue {
  notifications: AppNotification[];

  unreadCount: number;

  addNotification: (
    notification: CreateNotificationData
  ) => AppNotification;

  markAsRead: (
    notificationId: number
  ) => void;

  markAllAsRead: () => void;

  removeNotification: (
    notificationId: number
  ) => void;

  removeNotificationsByTicket: (
    ticketId: number
  ) => void;

  removeNotificationsByTicketAndTypes: (
    ticketId: number,
    types: readonly NotificationType[]
  ) => void;

  removeSlaNotificationsByTicket: (
    ticketId: number
  ) => void;

  clearNotifications: () => void;

  refreshNotifications: () => void;
}

interface NotificationProviderProps {
  children: ReactNode;
}

const NotificationContext =
  createContext<
    NotificationContextValue | undefined
  >(undefined);

export function NotificationProvider({
  children,
}: NotificationProviderProps) {
  const [
    notifications,
    setNotifications,
  ] = useState<AppNotification[]>(
    getNotifications
  );

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  function refreshNotifications(): void {
    setNotifications(
      getNotifications()
    );
  }

  function addNotification(
    notification:
      CreateNotificationData
  ): AppNotification {
    const createdNotification =
      addNotificationService(
        notification
      );

    setNotifications(
      (currentNotifications) => [
        createdNotification,
        ...currentNotifications,
      ]
    );

    return createdNotification;
  }

  function markAsRead(
    notificationId: number
  ): void {
    markNotificationAsReadService(
      notificationId
    );

    setNotifications(
      (currentNotifications) =>
        currentNotifications.map(
          (notification) =>
            notification.id ===
            notificationId
              ? {
                  ...notification,
                  read: true,
                }
              : notification
        )
    );
  }

  function markAllAsRead(): void {
    markAllNotificationsAsReadService();

    setNotifications(
      (currentNotifications) =>
        currentNotifications.map(
          (notification) => ({
            ...notification,
            read: true,
          })
        )
    );
  }

  function removeNotification(
    notificationId: number
  ): void {
    removeNotificationService(
      notificationId
    );

    setNotifications(
      (currentNotifications) =>
        currentNotifications.filter(
          (notification) =>
            notification.id !==
            notificationId
        )
    );
  }

  function removeNotificationsByTicket(
    ticketId: number
  ): void {
    removeNotificationsByTicketService(
      ticketId
    );

    setNotifications(
      (currentNotifications) =>
        currentNotifications.filter(
          (notification) =>
            notification.ticketId !==
            ticketId
        )
    );
  }

  function removeNotificationsByTicketAndTypes(
    ticketId: number,
    types: readonly NotificationType[]
  ): void {
    removeNotificationsByTicketAndTypesService(
      ticketId,
      types
    );

    setNotifications(
      (currentNotifications) =>
        currentNotifications.filter(
          (notification) => {
            const belongsToTicket =
              notification.ticketId ===
              ticketId;

            const hasSelectedType =
              types.includes(
                notification.type
              );

            return !(
              belongsToTicket &&
              hasSelectedType
            );
          }
        )
    );
  }

  function removeSlaNotificationsByTicket(
    ticketId: number
  ): void {
    removeSlaNotificationsByTicketService(
      ticketId
    );

    setNotifications(
      (currentNotifications) =>
        currentNotifications.filter(
          (notification) =>
            !(
              notification.ticketId ===
                ticketId &&
              (
                notification.type ===
                  "sla_warning" ||
                notification.type ===
                  "sla_expired"
              )
            )
        )
    );
  }

  function clearNotifications(): void {
    clearNotificationsService();

    setNotifications([]);
  }

  const contextValue =
    useMemo<NotificationContextValue>(
      () => ({
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        removeNotificationsByTicket,
        removeNotificationsByTicketAndTypes,
        removeSlaNotificationsByTicket,
        clearNotifications,
        refreshNotifications,
      }),
      [
        notifications,
        unreadCount,
      ]
    );

  return (
    <NotificationContext.Provider
      value={contextValue}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const context =
    useContext(
      NotificationContext
    );

  if (!context) {
    throw new Error(
      "useNotifications deve ser usado dentro de NotificationProvider."
    );
  }

  return context;
}