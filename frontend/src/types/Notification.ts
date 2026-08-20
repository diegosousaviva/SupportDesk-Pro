export type NotificationType =
  | "ticket_created"
  | "ticket_assigned"
  | "status_changed"
  | "ticket_resolved"
  | "ticket_reopened"
  | "comment_added"
  | "sla_warning"
  | "sla_expired";

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

  ticketId: number | null;

  userId: number | null;

  createdAt: string;
}