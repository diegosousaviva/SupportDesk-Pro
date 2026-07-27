import type { Ticket } from "../types/Ticket";

import {
  createTicketRepository,
  deleteTicketById,
  findAllTickets,
  findTicketById,
  updateTicketById,
} from "../repositories/ticketRepository";

import {
  createTicketHistoryEntry,
  deleteTicketHistory,
} from "./ticketHistoryService";

export type CreateTicketData = Omit<
  Ticket,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateTicketData = Partial<
  Omit<Ticket, "id" | "createdAt" | "updatedAt">
>;

function normalizeText(value: string): string {
  return value.trim();
}

function getTechnicianDescription(
  technicianId: number | null
): string {
  return technicianId === null
    ? "Não atribuído"
    : `Técnico #${technicianId}`;
}

function registerTicketChanges(
  currentTicket: Ticket,
  updatedTicket: Ticket
): void {
  if (
    normalizeText(currentTicket.title) !==
    normalizeText(updatedTicket.title)
  ) {
    createTicketHistoryEntry({
      ticketId: updatedTicket.id,
      eventType: "title_changed",
      description: `Título alterado de "${currentTicket.title}" para "${updatedTicket.title}".`,
    });
  }

  if (
    normalizeText(currentTicket.description) !==
    normalizeText(updatedTicket.description)
  ) {
    createTicketHistoryEntry({
      ticketId: updatedTicket.id,
      eventType: "description_changed",
      description: "A descrição do chamado foi atualizada.",
    });
  }

  if (currentTicket.category !== updatedTicket.category) {
    createTicketHistoryEntry({
      ticketId: updatedTicket.id,
      eventType: "category_changed",
      description: `Categoria alterada de "${currentTicket.category}" para "${updatedTicket.category}".`,
    });
  }

  if (currentTicket.priority !== updatedTicket.priority) {
    createTicketHistoryEntry({
      ticketId: updatedTicket.id,
      eventType: "priority_changed",
      description: `Prioridade alterada de "${currentTicket.priority}" para "${updatedTicket.priority}".`,
    });
  }

  if (currentTicket.status !== updatedTicket.status) {
    createTicketHistoryEntry({
      ticketId: updatedTicket.id,
      eventType: "status_changed",
      description: `Status alterado de "${currentTicket.status}" para "${updatedTicket.status}".`,
    });
  }

  if (
    currentTicket.assignedTechnicianId !==
    updatedTicket.assignedTechnicianId
  ) {
    const previousTechnician = getTechnicianDescription(
      currentTicket.assignedTechnicianId
    );

    const newTechnician = getTechnicianDescription(
      updatedTicket.assignedTechnicianId
    );

    createTicketHistoryEntry({
      ticketId: updatedTicket.id,
      eventType: "technician_changed",
      description: `Técnico responsável alterado de "${previousTechnician}" para "${newTechnician}".`,
    });
  }
}

export function getTickets(): Ticket[] {
  return findAllTickets();
}

export function getTicketById(
  id: number
): Ticket | undefined {
  return findTicketById(id);
}

export function createTicket(
  ticketData: CreateTicketData
): Ticket {
  const createdTicket = createTicketRepository(ticketData);

  createTicketHistoryEntry({
    ticketId: createdTicket.id,
    eventType: "ticket_created",
    description: "Chamado criado.",
  });

  return createdTicket;
}

export function updateTicket(
  id: number,
  updatedData: UpdateTicketData
): Ticket | undefined {
  const currentTicket = findTicketById(id);

  if (!currentTicket) {
    return undefined;
  }

  const updatedTicket = updateTicketById(id, updatedData);

  if (!updatedTicket) {
    return undefined;
  }

  registerTicketChanges(currentTicket, updatedTicket);

  return updatedTicket;
}

export function deleteTicket(id: number): boolean {
  const deleted = deleteTicketById(id);

  if (deleted) {
    deleteTicketHistory(id);
  }

  return deleted;
}