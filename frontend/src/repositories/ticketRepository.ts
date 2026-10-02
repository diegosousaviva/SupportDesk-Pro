import type { Ticket } from "../types/Ticket";
import { createData, deleteData, listData, updateData } from "../services/dataApi";

type CreateTicketData = Omit<Ticket, "id" | "createdAt" | "updatedAt">;
type UpdateTicketData = Partial<Omit<Ticket, "id" | "createdAt" | "updatedAt">>;
let ticketCache: Ticket[] = [];

export async function refreshTickets(): Promise<Ticket[]> {
  ticketCache = await listData<Ticket>("tickets");
  return [...ticketCache];
}

export function findAllTickets(): Ticket[] { return [...ticketCache]; }
export function findTicketById(id: number): Ticket | undefined { return ticketCache.find((ticket) => ticket.id === id); }

export async function createTicketRepository(data: CreateTicketData): Promise<Ticket> {
  const payload = { ...data, closedAt: data.status === "Resolvido" ? data.closedAt ?? new Date().toISOString() : null };
  const ticket = await createData<Ticket>("tickets", payload);
  ticketCache = [ticket, ...ticketCache];
  return ticket;
}

export async function updateTicketById(id: number, data: UpdateTicketData): Promise<Ticket | undefined> {
  const current = findTicketById(id);
  if (!current) return undefined;
  const status = data.status ?? current.status;
  const closedAt = status === "Resolvido"
    ? data.closedAt ?? (current.status === "Resolvido" ? current.closedAt : new Date().toISOString())
    : null;
  const updated = await updateData<Ticket>("tickets", id, { ...data, closedAt });
  ticketCache = ticketCache.map((ticket) => ticket.id === id ? updated : ticket);
  return updated;
}

export async function deleteTicketById(id: number): Promise<boolean> {
  await deleteData("tickets", id);
  ticketCache = ticketCache.filter((ticket) => ticket.id !== id);
  return true;
}
