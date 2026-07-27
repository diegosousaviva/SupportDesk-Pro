import type { TicketComment } from "../types/TicketComment";

import {
  createTicketCommentRepository,
  deleteTicketCommentById,
  findCommentsByTicketId,
} from "../repositories/ticketCommentRepository";

export type CreateTicketCommentData = Omit<
  TicketComment,
  "id" | "createdAt"
>;

export function getCommentsByTicketId(
  ticketId: number
): TicketComment[] {
  return findCommentsByTicketId(ticketId);
}

export function createTicketComment(
  commentData: CreateTicketCommentData
): TicketComment {
  return createTicketCommentRepository(commentData);
}

export function deleteTicketComment(
  id: number
): boolean {
  return deleteTicketCommentById(id);
}