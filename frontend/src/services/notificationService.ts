import { createData, deleteData, listData, updateData } from "./dataApi";
import type { AppNotification, NotificationType } from "../types/Notification";

interface DismissedSlaNotification {
  id: number;
  ticketId: number;
  type: NotificationType;
  createdAt?: string;
  updatedAt?: string;
}

type NewNotification = Omit<AppNotification, "id" | "createdAt">;

const slaTypes = new Set<NotificationType>(["sla_warning", "sla_expired"]);
let notifications: AppNotification[] = [];
let dismissedSlaNotifications: DismissedSlaNotification[] = [];

function sortNotifications(rows: AppNotification[]): AppNotification[] {
  return [...rows].sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt));
}

export async function refreshNotifications(): Promise<AppNotification[]> {
  const [storedNotifications, dismissals] = await Promise.all([
    listData<AppNotification>("notifications"),
    listData<DismissedSlaNotification>("sla-notification-dismissals"),
  ]);
  notifications = sortNotifications(storedNotifications);
  dismissedSlaNotifications = dismissals;
  return [...notifications];
}

export function clearNotificationCache(): void {
  notifications = [];
  dismissedSlaNotifications = [];
}

export function getNotifications(): AppNotification[] {
  return sortNotifications(notifications);
}

export function isSlaNotificationDismissed(ticketId: number, type: NotificationType): boolean {
  return slaTypes.has(type) && dismissedSlaNotifications.some(
    (entry) => entry.ticketId === ticketId && entry.type === type,
  );
}

async function recordSlaDismissal(ticketId: number, type: NotificationType): Promise<void> {
  if (!slaTypes.has(type) || isSlaNotificationDismissed(ticketId, type)) return;
  const dismissal = await createData<DismissedSlaNotification>("sla-notification-dismissals", { ticketId, type });
  dismissedSlaNotifications = [...dismissedSlaNotifications, dismissal];
}

export async function addNotification(notification: NewNotification): Promise<AppNotification> {
  const created = await createData<AppNotification>("notifications", notification);
  notifications = sortNotifications([created, ...notifications]);
  return created;
}

export async function markNotificationAsRead(id: number): Promise<void> {
  const updated = await updateData<AppNotification>("notifications", id, { read: true });
  notifications = notifications.map((entry) => entry.id === id ? updated : entry);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const unread = notifications.filter((entry) => !entry.read);
  const updated = await Promise.all(unread.map((entry) => updateData<AppNotification>("notifications", entry.id, { read: true })));
  const byId = new Map(updated.map((entry) => [entry.id, entry]));
  notifications = notifications.map((entry) => byId.get(entry.id) ?? entry);
}

async function removeNotifications(rows: AppNotification[], rememberSlaDismissals: boolean): Promise<void> {
  if (rememberSlaDismissals) {
    const dismissals = rows.filter((entry) => entry.ticketId !== null && slaTypes.has(entry.type));
    for (const entry of dismissals) await recordSlaDismissal(entry.ticketId!, entry.type);
  }
  try {
    await Promise.all(rows.map((entry) => deleteData("notifications", entry.id)));
  } catch (error) {
    await refreshNotifications().catch(() => undefined);
    throw error;
  }
  const removedIds = new Set(rows.map((entry) => entry.id));
  notifications = notifications.filter((entry) => !removedIds.has(entry.id));
}

export async function removeNotification(id: number): Promise<void> {
  const selected = notifications.find((entry) => entry.id === id);
  if (selected) await removeNotifications([selected], true);
}

export async function removeNotificationsByTicket(ticketId: number): Promise<void> {
  await removeNotifications(notifications.filter((entry) => entry.ticketId === ticketId), false);
}

export async function removeNotificationsByTicketAndTypes(
  ticketId: number,
  types: readonly NotificationType[],
): Promise<void> {
  const selected = notifications.filter((entry) => entry.ticketId === ticketId && types.includes(entry.type));
  await removeNotifications(selected, true);
}

export async function removeSlaNotificationsByTicket(ticketId: number): Promise<void> {
  await removeNotificationsByTicketAndTypes(ticketId, ["sla_warning", "sla_expired"]);
}

export async function clearNotifications(): Promise<void> {
  await removeNotifications(notifications, true);
}
