import * as XLSX from "xlsx";

import type {
  Ticket,
} from "../types/Ticket";

import type {
  User,
} from "../types/User";

function getTechnicianName(
  technicianId: number | null,
  users: User[]
): string {
  if (technicianId === null) {
    return "Não atribuído";
  }

  const technician = users.find(
    (user) =>
      user.id === technicianId
  );

  return technician?.name ??
    `Técnico não encontrado (#${technicianId})`;
}

function formatDate(
  dateValue: string
): string {
  const date = new Date(
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

export function exportTicketsToExcel(
  tickets: Ticket[],
  users: User[]
): void {
  const rows = tickets.map(
    (ticket) => ({
      ID: ticket.id,
      Título: ticket.title,
      Descrição: ticket.description,
      Categoria: ticket.category,
      Prioridade: ticket.priority,
      Status: ticket.status,
      Solicitante: ticket.requesterUserId,
      Técnico: getTechnicianName(
        ticket.assignedTechnicianId,
        users
      ),
      "Data de criação": formatDate(
        ticket.createdAt
      ),
      "Última atualização": formatDate(
        ticket.updatedAt
      ),
      "Data de encerramento":
        ticket.closedAt
          ? formatDate(
              ticket.closedAt
            )
          : "Não encerrado",
    })
  );

  const worksheet =
    XLSX.utils.json_to_sheet(
      rows
    );

  worksheet["!cols"] = [
    { wch: 10 },
    { wch: 32 },
    { wch: 55 },
    { wch: 20 },
    { wch: 14 },
    { wch: 18 },
    { wch: 14 },
    { wch: 28 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
  ];

  if (
    worksheet["!ref"]
  ) {
    worksheet["!autofilter"] = {
      ref: worksheet["!ref"],
    };
  }

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Chamados"
  );

  const currentDate =
    new Date()
      .toISOString()
      .slice(0, 10);

  XLSX.writeFile(
    workbook,
    `relatorio-chamados-${currentDate}.xlsx`
  );
}