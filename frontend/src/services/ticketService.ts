import type { Ticket } from "../types/Ticket";

import {
  deleteTicketById,
  findAllTickets,
  findTicketById,
  updateTicketById,
} from "../repositories/ticketRepository";

export function getTickets(): Ticket[] {
  return findAllTickets();
}

export function getTicketById(id: number): Ticket | undefined {
  return findTicketById(id);
}

export function updateTicket(
  id: number,
  updatedData: Partial<Ticket>
): Ticket | undefined {
  return updateTicketById(id, updatedData);
}

export function deleteTicket(id: number): boolean {
  return deleteTicketById(id);
}