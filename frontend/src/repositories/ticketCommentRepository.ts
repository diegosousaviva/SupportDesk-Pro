import type { TicketComment } from "../types/TicketComment";
import { createData, deleteData, listData, updateData } from "../services/dataApi";

export type CreateTicketCommentData = Omit<TicketComment, "id" | "createdAt" | "updatedAt">;
let comments: TicketComment[] = [];

export async function refreshTicketComments(): Promise<TicketComment[]> {
  comments = await listData<TicketComment>("ticket-comments");
  return [...comments];
}
export function findCommentsByTicketId(ticketId: number): TicketComment[] {
  return comments.filter((comment) => comment.ticketId === ticketId).sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}
export async function createTicketCommentRepository(data: CreateTicketCommentData): Promise<TicketComment> {
  const record = await createData<TicketComment>("ticket-comments", data);
  comments = [...comments, record];
  return record;
}
export async function updateTicketCommentRepository(id: number, message: string): Promise<TicketComment | null> {
  const current = comments.find((comment) => comment.id === id);
  if (!current) return null;
  const updated = await updateData<TicketComment>("ticket-comments", id, { message });
  comments = comments.map((comment) => comment.id === id ? updated : comment);
  return updated;
}
export async function deleteTicketCommentById(id: number): Promise<boolean> {
  await deleteData("ticket-comments", id);
  comments = comments.filter((comment) => comment.id !== id);
  return true;
}
export function deleteCommentsByTicketId(ticketId: number): void {
  comments = comments.filter((comment) => comment.ticketId !== ticketId);
}
