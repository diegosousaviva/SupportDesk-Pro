import type {
  Ticket,
} from "../types/Ticket";

import {
  createTicketRepository,
  deleteTicketById,
  findAllTickets,
  findTicketById,
  updateTicketById,
} from "../repositories/ticketRepository";

import {
  createAuditLog,
} from "./auditLogService";

import {
  getCurrentUser,
} from "./authService";

import {
  createTicketHistoryEntry,
  deleteTicketHistory,
} from "./ticketHistoryService";

import {
  getUserById,
} from "./userService";

export type CreateTicketData = Omit<
  Ticket,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateTicketData = Partial<
  Omit<
    Ticket,
    "id" | "createdAt" | "updatedAt"
  >
>;

function normalizeText(
  value: string
): string {
  return value.trim();
}

function getTechnicianDescription(
  technicianId: number | null
): string {
  if (
    technicianId === null
  ) {
    return "Não atribuído";
  }

  const technician =
    getUserById(
      technicianId
    );

  if (!technician) {
    return `Técnico não encontrado (#${technicianId})`;
  }

  return technician.name;
}

function getAuditUser(): {
  userId: number | null;
  userName: string;
} {
  const currentUser =
    getCurrentUser();

  if (!currentUser) {
    return {
      userId: null,
      userName: "Sistema",
    };
  }

  return {
    userId:
      currentUser.id,

    userName:
      currentUser.name,
  };
}

function registerAuditEvent(
  ticketId: number,
  action:
    | "Criação"
    | "Edição"
    | "Exclusão"
    | "Alteração de status"
    | "Alteração de responsável"
    | "Vinculação"
    | "Desvinculação",
  description: string,
  details?: string
): void {
  const auditUser =
    getAuditUser();

  createAuditLog({
    module:
      "Chamados",

    action,

    userId:
      auditUser.userId,

    userName:
      auditUser.userName,

    entityId:
      ticketId,

    description,

    details,
  });
}

function registerTicketChanges(
  currentTicket: Ticket,
  updatedTicket: Ticket
): void {
  const generalChanges:
    string[] = [];

  if (
    normalizeText(
      currentTicket.title
    ) !==
    normalizeText(
      updatedTicket.title
    )
  ) {
    createTicketHistoryEntry({
      ticketId:
        updatedTicket.id,

      eventType:
        "title_changed",

      description:
        `Título alterado de "${currentTicket.title}" para "${updatedTicket.title}".`,
    });

    generalChanges.push(
      `Título: "${currentTicket.title}" → "${updatedTicket.title}"`
    );
  }

  if (
    normalizeText(
      currentTicket.description
    ) !==
    normalizeText(
      updatedTicket.description
    )
  ) {
    createTicketHistoryEntry({
      ticketId:
        updatedTicket.id,

      eventType:
        "description_changed",

      description:
        "A descrição do chamado foi atualizada.",
    });

    generalChanges.push(
      "Descrição alterada"
    );
  }

  if (
    currentTicket.category !==
    updatedTicket.category
  ) {
    createTicketHistoryEntry({
      ticketId:
        updatedTicket.id,

      eventType:
        "category_changed",

      description:
        `Categoria alterada de "${currentTicket.category}" para "${updatedTicket.category}".`,
    });

    generalChanges.push(
      `Categoria: "${currentTicket.category}" → "${updatedTicket.category}"`
    );
  }

  if (
    currentTicket.priority !==
    updatedTicket.priority
  ) {
    createTicketHistoryEntry({
      ticketId:
        updatedTicket.id,

      eventType:
        "priority_changed",

      description:
        `Prioridade alterada de "${currentTicket.priority}" para "${updatedTicket.priority}".`,
    });

    generalChanges.push(
      `Prioridade: "${currentTicket.priority}" → "${updatedTicket.priority}"`
    );
  }

  /*
   * Caso exista alguma alteração geral,
   * criamos um único registro de auditoria
   * para evitar vários eventos repetitivos.
   */
  if (
    generalChanges.length >
    0
  ) {
    registerAuditEvent(
      updatedTicket.id,
      "Edição",
      `Chamado #${updatedTicket.id} editado.`,
      generalChanges.join(
        " | "
      )
    );
  }

  /*
   * Alteração de status recebe
   * um evento específico de auditoria.
   */
  if (
    currentTicket.status !==
    updatedTicket.status
  ) {
    createTicketHistoryEntry({
      ticketId:
        updatedTicket.id,

      eventType:
        "status_changed",

      description:
        `Status alterado de "${currentTicket.status}" para "${updatedTicket.status}".`,
    });

    registerAuditEvent(
      updatedTicket.id,
      "Alteração de status",
      `Status do chamado #${updatedTicket.id} alterado.`,
      `"${currentTicket.status}" → "${updatedTicket.status}"`
    );
  }

  /*
   * Alteração do técnico responsável.
   */
  if (
    currentTicket.assignedTechnicianId !==
    updatedTicket.assignedTechnicianId
  ) {
    const previousTechnician =
      getTechnicianDescription(
        currentTicket.assignedTechnicianId
      );

    const newTechnician =
      getTechnicianDescription(
        updatedTicket.assignedTechnicianId
      );

    createTicketHistoryEntry({
      ticketId:
        updatedTicket.id,

      eventType:
        "technician_changed",

      description:
        `Técnico responsável alterado de "${previousTechnician}" para "${newTechnician}".`,
    });

    registerAuditEvent(
      updatedTicket.id,
      "Alteração de responsável",
      `Responsável pelo chamado #${updatedTicket.id} alterado.`,
      `"${previousTechnician}" → "${newTechnician}"`
    );
  }

  /*
   * Auditoria do vínculo entre
   * Chamado e Inventário.
   */
  if (
    currentTicket.inventoryItemId !==
    updatedTicket.inventoryItemId
  ) {
    if (
      currentTicket.inventoryItemId ===
        null &&
      updatedTicket.inventoryItemId !==
        null
    ) {
      registerAuditEvent(
        updatedTicket.id,
        "Vinculação",
        `Equipamento vinculado ao chamado #${updatedTicket.id}.`,
        `Equipamento #${updatedTicket.inventoryItemId}`
      );
    } else if (
      currentTicket.inventoryItemId !==
        null &&
      updatedTicket.inventoryItemId ===
        null
    ) {
      registerAuditEvent(
        updatedTicket.id,
        "Desvinculação",
        `Equipamento desvinculado do chamado #${updatedTicket.id}.`,
        `Equipamento anterior #${currentTicket.inventoryItemId}`
      );
    } else {
      registerAuditEvent(
        updatedTicket.id,
        "Vinculação",
        `Equipamento vinculado ao chamado #${updatedTicket.id} foi alterado.`,
        `Equipamento #${currentTicket.inventoryItemId} → #${updatedTicket.inventoryItemId}`
      );
    }
  }
}

export function getTickets():
  Ticket[] {
  return findAllTickets();
}

export function getTicketById(
  id: number
): Ticket | undefined {
  return findTicketById(
    id
  );
}

export function createTicket(
  ticketData: CreateTicketData
): Ticket {
  const createdTicket =
    createTicketRepository(
      ticketData
    );

  createTicketHistoryEntry({
    ticketId:
      createdTicket.id,

    eventType:
      "ticket_created",

    description:
      "Chamado criado.",
  });

  registerAuditEvent(
    createdTicket.id,
    "Criação",
    `Chamado #${createdTicket.id} criado.`,
    `Título: "${createdTicket.title}" | Prioridade: ${createdTicket.priority} | Status: ${createdTicket.status}`
  );

  if (
    createdTicket.assignedTechnicianId !==
    null
  ) {
    const technicianName =
      getTechnicianDescription(
        createdTicket.assignedTechnicianId
      );

    createTicketHistoryEntry({
      ticketId:
        createdTicket.id,

      eventType:
        "technician_changed",

      description:
        `Chamado atribuído ao técnico "${technicianName}".`,
    });

    registerAuditEvent(
      createdTicket.id,
      "Alteração de responsável",
      `Chamado #${createdTicket.id} atribuído a um técnico.`,
      `Responsável: "${technicianName}"`
    );
  }

  if (
    createdTicket.inventoryItemId !==
    null
  ) {
    registerAuditEvent(
      createdTicket.id,
      "Vinculação",
      `Equipamento vinculado ao chamado #${createdTicket.id}.`,
      `Equipamento #${createdTicket.inventoryItemId}`
    );
  }

  return createdTicket;
}

export function updateTicket(
  id: number,
  updatedData: UpdateTicketData
): Ticket | undefined {
  const currentTicket =
    findTicketById(
      id
    );

  if (!currentTicket) {
    return undefined;
  }

  const updatedTicket =
    updateTicketById(
      id,
      updatedData
    );

  if (!updatedTicket) {
    return undefined;
  }

  registerTicketChanges(
    currentTicket,
    updatedTicket
  );

  return updatedTicket;
}

export function deleteTicket(
  id: number
): boolean {
  const currentTicket =
    findTicketById(
      id
    );

  if (!currentTicket) {
    return false;
  }

  const deleted =
    deleteTicketById(
      id
    );

  if (deleted) {
    registerAuditEvent(
      currentTicket.id,
      "Exclusão",
      `Chamado #${currentTicket.id} excluído.`,
      `Título: "${currentTicket.title}" | Status: ${currentTicket.status} | Prioridade: ${currentTicket.priority}`
    );

    deleteTicketHistory(
      id
    );
  }

  return deleted;
}