import type {
  AppNotification,
  NotificationType,
} from "../types/Notification";

const STORAGE_KEY =
  "supportdesk-pro-notifications";

function saveNotifications(
  notifications: AppNotification[]
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      notifications
    )
  );
}

export function getNotifications(): AppNotification[] {
  const storedNotifications =
    localStorage.getItem(
      STORAGE_KEY
    );

  if (!storedNotifications) {
    return [];
  }

  try {
    const parsedData =
      JSON.parse(
        storedNotifications
      ) as unknown;

    if (
      !Array.isArray(
        parsedData
      )
    ) {
      return [];
    }

    return parsedData as AppNotification[];
  } catch (error) {
    console.error(
      "Não foi possível carregar as notificações.",
      error
    );

    return [];
  }
}

export function addNotification(
  notification: Omit<
    AppNotification,
    "id" | "createdAt"
  >
): AppNotification {
  const notifications =
    getNotifications();

  const highestId =
    notifications.reduce(
      (
        currentHighestId,
        currentNotification
      ) =>
        Math.max(
          currentHighestId,
          currentNotification.id
        ),
      0
    );

  const newNotification: AppNotification =
    {
      ...notification,

      id:
        highestId + 1,

      createdAt:
        new Date().toISOString(),
    };

  saveNotifications([
    newNotification,
    ...notifications,
  ]);

  return newNotification;
}

export function markNotificationAsRead(
  id: number
): void {
  const notifications =
    getNotifications().map(
      (notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification
    );

  saveNotifications(
    notifications
  );
}

export function markAllNotificationsAsRead(): void {
  const notifications =
    getNotifications().map(
      (notification) => ({
        ...notification,
        read: true,
      })
    );

  saveNotifications(
    notifications
  );
}

export function removeNotification(
  id: number
): void {
  const notifications =
    getNotifications().filter(
      (notification) =>
        notification.id !== id
    );

  saveNotifications(
    notifications
  );
}

export function removeNotificationsByTicket(
  ticketId: number
): void {
  const notifications =
    getNotifications().filter(
      (notification) =>
        notification.ticketId !==
        ticketId
    );

  saveNotifications(
    notifications
  );
}

export function removeNotificationsByTicketAndTypes(
  ticketId: number,
  types: readonly NotificationType[]
): void {
  const notifications =
    getNotifications().filter(
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
    );

  saveNotifications(
    notifications
  );
}

export function removeSlaNotificationsByTicket(
  ticketId: number
): void {
  removeNotificationsByTicketAndTypes(
    ticketId,
    [
      "sla_warning",
      "sla_expired",
    ]
  );
}

export function clearNotifications(): void {
  localStorage.removeItem(
    STORAGE_KEY
  );
}