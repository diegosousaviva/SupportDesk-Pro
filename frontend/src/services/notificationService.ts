import type {
  AppNotification,
  NotificationType,
} from "../types/Notification";

const STORAGE_KEY =
  "supportdesk-pro-notifications";

const DISMISSED_SLA_STORAGE_KEY =
  "supportdesk-pro-dismissed-sla-notifications";

interface DismissedSlaNotification {
  ticketId: number;
  type: NotificationType;
}

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

function getDismissedSlaNotifications():
  DismissedSlaNotification[] {
  const storedValue =
    localStorage.getItem(
      DISMISSED_SLA_STORAGE_KEY
    );

  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue =
      JSON.parse(
        storedValue
      ) as unknown;

    if (
      !Array.isArray(
        parsedValue
      )
    ) {
      return [];
    }

    return parsedValue.filter(
      (
        item
      ): item is DismissedSlaNotification => {
        if (
          typeof item !==
            "object" ||
          item ===
            null
        ) {
          return false;
        }

        const candidate =
          item as Partial<DismissedSlaNotification>;

        return (
          typeof candidate.ticketId ===
            "number" &&
          typeof candidate.type ===
            "string"
        );
      }
    );
  } catch {
    return [];
  }
}

function saveDismissedSlaNotifications(
  notifications:
    DismissedSlaNotification[]
): void {
  localStorage.setItem(
    DISMISSED_SLA_STORAGE_KEY,
    JSON.stringify(
      notifications
    )
  );
}

function isSlaNotificationType(
  type:
    NotificationType
): boolean {
  return (
    type ===
      "sla_warning" ||
    type ===
      "sla_expired"
  );
}

function registerDismissedSlaNotification(
  ticketId:
    number,
  type:
    NotificationType
): void {
  if (
    !isSlaNotificationType(
      type
    )
  ) {
    return;
  }

  const dismissedNotifications =
    getDismissedSlaNotifications();

  const alreadyRegistered =
    dismissedNotifications.some(
      (
        notification
      ) =>
        notification.ticketId ===
          ticketId &&
        notification.type ===
          type
    );

  if (
    alreadyRegistered
  ) {
    return;
  }

  saveDismissedSlaNotifications([
    ...dismissedNotifications,

    {
      ticketId,
      type,
    },
  ]);
}

export function isSlaNotificationDismissed(
  ticketId:
    number,
  type:
    NotificationType
): boolean {
  if (
    !isSlaNotificationType(
      type
    )
  ) {
    return false;
  }

  return getDismissedSlaNotifications().some(
    (
      notification
    ) =>
      notification.ticketId ===
        ticketId &&
      notification.type ===
        type
  );
}

export function getNotifications():
  AppNotification[] {
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

  const newNotification:
    AppNotification = {
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
  id:
    number
): void {
  const notifications =
    getNotifications().map(
      (
        notification
      ) =>
        notification.id ===
        id
          ? {
              ...notification,
              read:
                true,
            }
          : notification
    );

  saveNotifications(
    notifications
  );
}

export function markAllNotificationsAsRead():
  void {
  const notifications =
    getNotifications().map(
      (
        notification
      ) => ({
        ...notification,
        read:
          true,
      })
    );

  saveNotifications(
    notifications
  );
}

export function removeNotification(
  id:
    number
): void {
  const notifications =
    getNotifications();

  const notificationToRemove =
    notifications.find(
      (
        notification
      ) =>
        notification.id ===
        id
    );

  if (
    notificationToRemove &&
    notificationToRemove.ticketId !==
      null &&
    isSlaNotificationType(
      notificationToRemove.type
    )
  ) {
    registerDismissedSlaNotification(
      notificationToRemove.ticketId,
      notificationToRemove.type
    );
  }

  const filteredNotifications =
    notifications.filter(
      (
        notification
      ) =>
        notification.id !==
        id
    );

  saveNotifications(
    filteredNotifications
  );
}

export function removeNotificationsByTicket(
  ticketId:
    number
): void {
  const notifications =
    getNotifications().filter(
      (
        notification
      ) =>
        notification.ticketId !==
        ticketId
    );

  saveNotifications(
    notifications
  );
}

export function removeNotificationsByTicketAndTypes(
  ticketId:
    number,
  types:
    readonly NotificationType[]
): void {
  const notifications =
    getNotifications().filter(
      (
        notification
      ) => {
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
  ticketId:
    number
): void {
  removeNotificationsByTicketAndTypes(
    ticketId,
    [
      "sla_warning",
      "sla_expired",
    ]
  );
}

export function clearNotifications():
  void {
  const notifications =
    getNotifications();

  notifications.forEach(
    (
      notification
    ) => {
      if (
        notification.ticketId ===
          null ||
        !isSlaNotificationType(
          notification.type
        )
      ) {
        return;
      }

      registerDismissedSlaNotification(
        notification.ticketId,
        notification.type
      );
    }
  );

  localStorage.removeItem(
    STORAGE_KEY
  );
}