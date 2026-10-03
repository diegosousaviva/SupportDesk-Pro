import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { useSnackbar } from "../hooks/useSnackbar";
import {
  addNotification as addNotificationService,
  clearNotificationCache,
  clearNotifications as clearNotificationsService,
  getNotifications,
  markAllNotificationsAsRead as markAllNotificationsAsReadService,
  markNotificationAsRead as markNotificationAsReadService,
  refreshNotifications as refreshNotificationsService,
  removeNotification as removeNotificationService,
  removeNotificationsByTicket as removeNotificationsByTicketService,
  removeNotificationsByTicketAndTypes as removeNotificationsByTicketAndTypesService,
  removeSlaNotificationsByTicket as removeSlaNotificationsByTicketService,
} from "../services/notificationService";
import type { AppNotification, NotificationType } from "../types/Notification";
import { NotificationContext } from "./NotificationContextValue";
import type { CreateNotificationData, NotificationContextValue } from "./NotificationContextValue";

const EMPTY_NOTIFICATIONS: AppNotification[] = [];

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Não foi possível salvar a notificação.";
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { showError } = useSnackbar();
  const [notificationState, setNotificationState] = useState<{ user: typeof user; items: AppNotification[] }>(() => ({ user, items: [] }));
  const notifications = notificationState.user === user ? notificationState.items : EMPTY_NOTIFICATIONS;
  const setNotifications = useCallback((items: AppNotification[]) => setNotificationState({ user, items }), [user]);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const refreshNotifications = useCallback(async (): Promise<void> => {
    if (!user) return;
    try {
      setNotifications(await refreshNotificationsService());
    } catch (error) {
      showError(errorMessage(error));
    }
  }, [setNotifications, showError, user]);

  useEffect(() => {
    if (!user) {
      clearNotificationCache();
      return;
    }
    void refreshNotificationsService()
      .then(setNotifications)
      .catch((error: unknown) => showError(errorMessage(error)));
    const interval = window.setInterval(() => { void refreshNotifications(); }, 60_000);
    return () => window.clearInterval(interval);
  }, [refreshNotifications, setNotifications, showError, user]);

  const addNotification = useCallback(async (data: CreateNotificationData): Promise<AppNotification | undefined> => {
    try {
      const created = await addNotificationService(data);
      setNotifications(getNotifications());
      return created;
    } catch (error) {
      showError(errorMessage(error));
      return undefined;
    }
  }, [setNotifications, showError]);

  const markAsRead = useCallback(async (id: number): Promise<void> => {
    try {
      await markNotificationAsReadService(id);
      setNotifications(getNotifications());
    } catch (error) {
      showError(errorMessage(error));
    }
  }, [setNotifications, showError]);

  const markAllAsRead = useCallback(async (): Promise<void> => {
    try {
      await markAllNotificationsAsReadService();
      setNotifications(getNotifications());
    } catch (error) {
      showError(errorMessage(error));
    }
  }, [setNotifications, showError]);

  const removeNotification = useCallback(async (id: number): Promise<void> => {
    try {
      await removeNotificationService(id);
      setNotifications(getNotifications());
    } catch (error) {
      showError(errorMessage(error));
    }
  }, [setNotifications, showError]);

  const removeNotificationsByTicket = useCallback(async (ticketId: number): Promise<void> => {
    try {
      await removeNotificationsByTicketService(ticketId);
      setNotifications(getNotifications());
    } catch (error) {
      showError(errorMessage(error));
    }
  }, [setNotifications, showError]);

  const removeNotificationsByTicketAndTypes = useCallback(async (
    ticketId: number,
    types: readonly NotificationType[],
  ): Promise<void> => {
    try {
      await removeNotificationsByTicketAndTypesService(ticketId, types);
      setNotifications(getNotifications());
    } catch (error) {
      showError(errorMessage(error));
    }
  }, [setNotifications, showError]);

  const removeSlaNotificationsByTicket = useCallback(async (ticketId: number): Promise<void> => {
    try {
      await removeSlaNotificationsByTicketService(ticketId);
      setNotifications(getNotifications());
    } catch (error) {
      showError(errorMessage(error));
    }
  }, [setNotifications, showError]);

  const clearNotifications = useCallback(async (): Promise<void> => {
    try {
      await clearNotificationsService();
      setNotifications(getNotifications());
    } catch (error) {
      showError(errorMessage(error));
    }
  }, [setNotifications, showError]);

  const value = useMemo<NotificationContextValue>(() => ({
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
  }), [
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
  ]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
