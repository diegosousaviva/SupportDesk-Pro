export type TicketHistoryEventType =
  | "ticket_created"
  | "title_changed"
  | "description_changed"
  | "category_changed"
  | "priority_changed"
  | "status_changed"
  | "technician_changed"
  | "comment_added"
  | "equipment_linked"
  | "equipment_unlinked"
  | "equipment_changed";

export interface TicketHistoryEntry {
  id: number;

  ticketId: number;

  eventType: TicketHistoryEventType;

  description: string;

  createdAt: string;
}