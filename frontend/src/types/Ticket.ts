export type TicketPriority =
  | "Baixa"
  | "Média"
  | "Alta"
  | "Crítica";

export type TicketStatus =
  | "Aberto"
  | "Em andamento"
  | "Resolvido";

export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTechnicianId: number | null;
  createdAt: string;
  updatedAt: string;
}