import * as XLSX from "xlsx";

import type {
  InventoryItem,
} from "../types/InventoryItem";

import type {
  Store,
} from "../types/Store";

import type {
  Ticket,
} from "../types/Ticket";

import type {
  User,
} from "../types/User";

import {
  createCategoryReport,
} from "./categoryReportService";

import {
  calculateTicketSla,
  getSlaRemainingLabel,
  getSlaStatusLabel,
} from "./slaService";

import {
  createStoreReport,
} from "./storeReportService";

import {
  createTechnicianReport,
} from "./technicianReportService";

function getTechnicianName(
  technicianId: number | null,
  users: User[]
): string {
  if (technicianId === null) {
    return "Não atribuído";
  }

  const technician =
    users.find(
      (user) =>
        user.id ===
        technicianId
    );

  return (
    technician?.name ??
    `Técnico não encontrado (#${technicianId})`
  );
}

function getRequesterName(
  requesterUserId: number,
  users: User[]
): string {
  const requester =
    users.find(
      (user) =>
        user.id ===
        requesterUserId
    );

  return (
    requester?.name ??
    `Usuário não encontrado (#${requesterUserId})`
  );
}

function formatDate(
  dateValue: string
): string {
  const date =
    new Date(
      dateValue
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Data não disponível";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(date);
}

function configureWorksheet(
  worksheet: XLSX.WorkSheet,
  columnWidths: number[]
): void {
  worksheet["!cols"] =
    columnWidths.map(
      (width) => ({
        wch: width,
      })
    );

  if (
    worksheet["!ref"]
  ) {
    worksheet["!autofilter"] = {
      ref:
        worksheet["!ref"],
    };
  }
}

export function exportTicketsToExcel(
  tickets: Ticket[],
  users: User[],
  inventoryItems: InventoryItem[],
  stores: Store[]
): void {
  /*
   * ABA 1
   * Chamados detalhados
   */
  const ticketRows =
    tickets.map(
      (ticket) => {
        const sla =
          calculateTicketSla(
            ticket
          );

        return {
          ID:
            ticket.id,

          Título:
            ticket.title,

          Descrição:
            ticket.description,

          Categoria:
            ticket.category,

          Prioridade:
            ticket.priority,

          Status:
            ticket.status,

          Solicitante:
            getRequesterName(
              ticket.requesterUserId,
              users
            ),

          Técnico:
            getTechnicianName(
              ticket.assignedTechnicianId,
              users
            ),

          "Status do SLA":
            getSlaStatusLabel(
              sla.status
            ),

          "Situação do SLA":
            getSlaRemainingLabel(
              sla
            ),

          "Prazo do SLA (horas)":
            sla.targetHours,

          "Vencimento do SLA":
            formatDate(
              sla.dueDate
            ),

          "Data de criação":
            formatDate(
              ticket.createdAt
            ),

          "Última atualização":
            formatDate(
              ticket.updatedAt
            ),

          "Data de encerramento":
            ticket.closedAt
              ? formatDate(
                  ticket.closedAt
                )
              : "Não encerrado",
        };
      }
    );

  const ticketWorksheet =
    XLSX.utils.json_to_sheet(
      ticketRows
    );

  configureWorksheet(
    ticketWorksheet,
    [
      10,
      32,
      55,
      20,
      14,
      18,
      28,
      28,
      30,
      38,
      22,
      24,
      22,
      22,
      22,
    ]
  );

  /*
   * ABA 2
   * Por Técnico
   */
  const technicianReport =
    createTechnicianReport(
      tickets,
      users
    );

  const technicianRows =
    technicianReport.map(
      (technician) => ({
        Técnico:
          technician.technicianName,

        "Chamados atribuídos":
          technician.assignedTickets,

        Resolvidos:
          technician.resolvedTickets,

        Pendentes:
          technician.pendingTickets,

        Críticos:
          technician.criticalTickets,

        "Taxa de resolução":
          `${technician.resolutionRate}%`,

        "Conformidade SLA":
          `${technician.slaCompliance}%`,
      })
    );

  const technicianWorksheet =
    XLSX.utils.json_to_sheet(
      technicianRows
    );

  configureWorksheet(
    technicianWorksheet,
    [
      35,
      22,
      18,
      18,
      18,
      24,
      24,
    ]
  );

  /*
   * ABA 3
   * Por Loja
   */
  const storeReport =
    createStoreReport(
      tickets,
      inventoryItems,
      stores
    );

  const storeRows =
    storeReport.map(
      (store) => ({
        Código:
          store.storeCode,

        Loja:
          store.storeName,

        "Total de chamados":
          store.totalTickets,

        Abertos:
          store.openTickets,

        "Em andamento":
          store.inProgressTickets,

        Resolvidos:
          store.resolvedTickets,

        Críticos:
          store.criticalTickets,

        "Taxa de resolução":
          `${store.resolutionRate}%`,

        "Conformidade SLA":
          `${store.slaCompliance}%`,
      })
    );

  const storeWorksheet =
    XLSX.utils.json_to_sheet(
      storeRows
    );

  configureWorksheet(
    storeWorksheet,
    [
      18,
      35,
      22,
      16,
      20,
      18,
      16,
      24,
      24,
    ]
  );

  /*
   * ABA 4
   * Por Categoria
   */
  const categoryReport =
    createCategoryReport(
      tickets
    );

  const categoryRows =
    categoryReport.map(
      (category) => ({
        Categoria:
          category.category,

        "Total de chamados":
          category.totalTickets,

        Abertos:
          category.openTickets,

        "Em andamento":
          category.inProgressTickets,

        Resolvidos:
          category.resolvedTickets,

        Críticos:
          category.criticalTickets,

        "Taxa de resolução":
          `${category.resolutionRate}%`,

        "Conformidade SLA":
          `${category.slaCompliance}%`,
      })
    );

  const categoryWorksheet =
    XLSX.utils.json_to_sheet(
      categoryRows
    );

  configureWorksheet(
    categoryWorksheet,
    [
      30,
      22,
      16,
      20,
      18,
      16,
      24,
      24,
    ]
  );

  /*
   * Criação do arquivo Excel
   */
  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    ticketWorksheet,
    "Chamados"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    technicianWorksheet,
    "Por Técnico"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    storeWorksheet,
    "Por Loja"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    categoryWorksheet,
    "Por Categoria"
  );

  const currentDate =
    new Date()
      .toISOString()
      .slice(
        0,
        10
      );

  XLSX.writeFile(
    workbook,
    `relatorio-chamados-${currentDate}.xlsx`
  );
}