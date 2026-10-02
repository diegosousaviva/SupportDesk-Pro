import type { TicketComment } from "../types/TicketComment";

import {
  createTicketCommentRepository,
  deleteCommentsByTicketId,
  deleteTicketCommentById,
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

export async function createTicketComment(
  commentData: CreateTicketCommentData
): Promise<TicketComment> {
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

export async function updateTicketComment(
  id: number,
  message: string
): Promise<TicketComment> {
  const normalizedMessage = message.trim();

  if (!normalizedMessage) {
    throw new Error(
      "Informe um comentário."
    );
  }

  const updatedComment =
    await updateTicketCommentRepository(
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

export async function deleteTicketComment(
  id: number
): Promise<void> {
  const deleted =
    await deleteTicketCommentById(id);

  if (!deleted) {
    throw new Error(
      "Comentário não encontrado."
    );
  }
}

export function deleteTicketComments(
  ticketId: number
): void {
  deleteCommentsByTicketId(ticketId);
}
