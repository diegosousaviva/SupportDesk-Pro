import type {
  Ticket,
} from "../types/Ticket";

import type {
  User,
} from "../types/User";

import {
  calculateTicketSla,
  getSlaRemainingLabel,
  getSlaStatusLabel,
} from "./slaService";

function getTechnicianName(
  technicianId: number | null,
  users: User[]
): string {
  if (
    technicianId ===
    null
  ) {
    return "Não atribuído";
  }

  const technician =
    users.find(
      (user) =>
        user.id ===
        technicianId
    );

  return technician?.name ??
    "Não encontrado";
}

function formatDate(
  value: string
): string {
  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Data não disponível";
  }

  return date.toLocaleString(
    "pt-BR"
  );
}

export function exportTicketsToCsv(
  tickets: Ticket[],
  users: User[]
): void {
  const header = [
    "ID",
    "Título",
    "Categoria",
    "Prioridade",
    "Status",
    "Técnico",
    "SLA",
    "Situação do SLA",
    "Prazo do SLA (horas)",
    "Vencimento do SLA",
    "Data de criação",
  ];

  const rows =
    tickets.map(
      (ticket) => {
        const sla =
          calculateTicketSla(
            ticket
          );

        return [
          ticket.id,
          ticket.title,
          ticket.category,
          ticket.priority,
          ticket.status,

          getTechnicianName(
            ticket.assignedTechnicianId,
            users
          ),

          getSlaStatusLabel(
            sla.status
          ),

          getSlaRemainingLabel(
            sla
          ),

          sla.targetHours,

          formatDate(
            sla.dueDate
          ),

          formatDate(
            ticket.createdAt
          ),
        ];
      }
    );

  const csvContent = [
    header,
    ...rows,
  ]
    .map(
      (row) =>
        row
          .map(
            (value) =>
              `"${String(
                value
              ).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(";")
    )
    .join("\n");

  const blob =
    new Blob(
      [
        "\uFEFF" +
          csvContent,
      ],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href =
    url;

  link.download =
    `relatorio-chamados-${new Date()
      .toISOString()
      .slice(
        0,
        10
      )}.csv`;

  document.body.appendChild(
    link
  );

  link.click();

  document.body.removeChild(
    link
  );

  URL.revokeObjectURL(
    url
  );
}