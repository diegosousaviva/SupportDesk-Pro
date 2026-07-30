import type { TicketComment } from "../types/TicketComment";

import {
  createTicketCommentRepository,
  deleteCommentsByTicketId,
  findCommentsByTicketId,
  updateTicketCommentRepository,
} from "../repositories/ticketCommentRepository";

export type CreateTicketCommentData = Omit<
  TicketComment,
  "id" | "createdAt" | "updatedAt"
>;

export function getTicketComments(
  ticketId: number
): TicketComment[] {
  return findCommentsByTicketId(ticketId);
}

export function createTicketComment(
  commentData: CreateTicketCommentData
): TicketComment {
  const message = commentData.message.trim();

  if (!message) {
    throw new Error(
      "Informe um comentário."
    );
  }

  return createTicketCommentRepository({
    ...commentData,
    message,
  });
}

export function updateTicketComment(
  id: number,
  message: string
): TicketComment {
  const normalizedMessage = message.trim();

  if (!normalizedMessage) {
    throw new Error(
      "Informe um comentário."
    );
  }

  const updatedComment =
    updateTicketCommentRepository(
      id,
      normalizedMessage
    );

  if (!updatedComment) {
    throw new Error(
      "Comentário não encontrado."
    );
  }

  return updatedComment;
}

export function deleteTicketComments(
  ticketId: number
): void {
  deleteCommentsByTicketId(ticketId);
}