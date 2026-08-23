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

  requesterUserId: number;

  /**
   * Loja solicitante do chamado.
   * null = chamado ainda não possui loja associada.
   */
  storeId: number | null;

  assignedTechnicianId: number | null;

  /**
   * Equipamento vinculado ao chamado.
   * null = chamado não está relacionado a nenhum equipamento.
   */
  inventoryItemId: number | null;

  createdAt: string;

  updatedAt: string;

  closedAt: string | null;
}