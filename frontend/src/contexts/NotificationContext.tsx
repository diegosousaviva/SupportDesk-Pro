import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
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

export type CreateNotificationData = Omit<AppNotification, "id" | "createdAt">;

interface NotificationContextValue {
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

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Não foi possível salvar a notificação.";
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { showError } = useSnackbar();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const refreshNotifications = useCallback(async (): Promise<void> => {
    if (!user) return;
    try {
      setNotifications(await refreshNotificationsService());
    } catch (error) {
      showError(errorMessage(error));
    }
  }, [showError, user?.id]);

  useEffect(() => {
    if (!user) {
      clearNotificationCache();
      setNotifications([]);
      return;
    }
    void refreshNotifications();
    const interval = window.setInterval(() => { void refreshNotifications(); }, 60_000);
    return () => window.clearInterval(interval);
  }, [refreshNotifications, user]);

  const addNotification = useCallback(async (data: CreateNotificationData): Promise<AppNotification | undefined> => {
    try {
      const created = await addNotificationService(data);
      setNotifications(getNotifications());
      return created;
    } catch (error) {
      showError(errorMessage(error));
      return undefined;
    }
  }, [showError]);

  const markAsRead = useCallback(async (id: number): Promise<void> => {
    try {
      await markNotificationAsReadService(id);
      setNotifications(getNotifications());
    } catch (error) {
      showError(errorMessage(error));
    }
  }, [showError]);

  const markAllAsRead = useCallback(async (): Promise<void> => {
    try {
      await markAllNotificationsAsReadService();
      setNotifications(getNotifications());
    } catch (error) {
      showError(errorMessage(error));
    }
  }, [showError]);

  const removeNotification = useCallback(async (id: number): Promise<void> => {
    try {
      await removeNotificationService(id);
      setNotifications(getNotifications());
    } catch (error) {
      showError(errorMessage(error));
    }
  }, [showError]);

  const removeNotificationsByTicket = useCallback(async (ticketId: number): Promise<void> => {
    try {
      await removeNotificationsByTicketService(ticketId);
      setNotifications(getNotifications());
    } catch (error) {
      showError(errorMessage(error));
    }
  }, [showError]);

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
  }, [showError]);

  const removeSlaNotificationsByTicket = useCallback(async (ticketId: number): Promise<void> => {
    try {
      await removeSlaNotificationsByTicketService(ticketId);
      setNotifications(getNotifications());
    } catch (error) {
      showError(errorMessage(error));
    }
  }, [showError]);

  const clearNotifications = useCallback(async (): Promise<void> => {
    try {
      await clearNotificationsService();
      setNotifications(getNotifications());
    } catch (error) {
      showError(errorMessage(error));
    }
  }, [showError]);

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

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications deve ser usado dentro de NotificationProvider.");
  return context;
}
