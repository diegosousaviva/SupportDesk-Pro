export interface TicketComment {
  id: number;
  ticketId: number;
  authorId: number;
  authorName: string;
  message: string;
  createdAt: string;
  updatedAt?: string;
}