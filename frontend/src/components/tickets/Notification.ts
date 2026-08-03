export type NotificationType =
  | "ticket_created"
  | "ticket_assigned"
  | "status_changed"
  | "ticket_resolved"
  | "sla_warning"
  | "sla_expired"
  | "system";

export type NotificationSeverity =
  | "info"
  | "success"
  | "warning"
  | "error";

export interface AppNotification {
  id: number;

  title: string;

  message: string;

  type: NotificationType;

  severity: NotificationSeverity;

  read: boolean;

  createdAt: string;

  ticketId: number | null;

  userId: number | null;
}