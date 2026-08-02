import {
  jsPDF,
} from "jspdf";

import {
  autoTable,
} from "jspdf-autotable";

import type {
  Ticket,
} from "../types/Ticket";

import type {
  User,
} from "../types/User";

interface ReportPdfSummary {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  criticalTickets: number;
}

interface ExportTicketsToPdfParams {
  tickets: Ticket[];
  users: User[];
  summary: ReportPdfSummary;
}

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
        user.id === technicianId
    );

  return (
    technician?.name ??
    `Técnico não encontrado (#${technicianId})`
  );
}

function formatDate(
  dateValue: string
): string {
  const date =
    new Date(dateValue);

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

function formatCurrentDate(): string {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "long",
      timeStyle: "short",
    }
  ).format(
    new Date()
  );
}

function createFileName(): string {
  const currentDate =
    new Date()
      .toISOString()
      .slice(0, 10);

  return `relatorio-chamados-${currentDate}.pdf`;
}

export function exportTicketsToPdf({
  tickets,
  users,
  summary,
}: ExportTicketsToPdfParams): void {
  const document =
    new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

  const pageWidth =
    document.internal.pageSize.getWidth();

  const pageHeight =
    document.internal.pageSize.getHeight();

  const horizontalMargin = 14;

  document.setFillColor(
    21,
    101,
    192
  );

  document.rect(
    0,
    0,
    pageWidth,
    25,
    "F"
  );

  document.setTextColor(
    255,
    255,
    255
  );

  document.setFont(
    "helvetica",
    "bold"
  );

  document.setFontSize(18);

  document.text(
    "SupportDesk Pro",
    horizontalMargin,
    11
  );

  document.setFont(
    "helvetica",
    "normal"
  );

  document.setFontSize(10);

  document.text(
    "Central de Suporte",
    horizontalMargin,
    17
  );

  document.setTextColor(
    31,
    41,
    55
  );

  document.setFont(
    "helvetica",
    "bold"
  );

  document.setFontSize(17);

  document.text(
    "Relatório de chamados",
    horizontalMargin,
    37
  );

  document.setFont(
    "helvetica",
    "normal"
  );

  document.setFontSize(9);

  document.setTextColor(
    100,
    116,
    139
  );

  document.text(
    `Gerado em: ${formatCurrentDate()}`,
    horizontalMargin,
    43
  );

  const summaryTop = 50;
  const cardGap = 3;

  const availableWidth =
    pageWidth -
    horizontalMargin * 2;

  const cardWidth =
    (
      availableWidth -
      cardGap * 4
    ) / 5;

  const summaryItems = [
    {
      label: "Total",
      value: summary.totalTickets,
    },
    {
      label: "Abertos",
      value: summary.openTickets,
    },
    {
      label: "Em andamento",
      value:
        summary.inProgressTickets,
    },
    {
      label: "Resolvidos",
      value:
        summary.resolvedTickets,
    },
    {
      label: "Críticos",
      value:
        summary.criticalTickets,
    },
  ];

  summaryItems.forEach(
    (
      item,
      index
    ) => {
      const cardX =
        horizontalMargin +
        index *
          (
            cardWidth +
            cardGap
          );

      document.setFillColor(
        248,
        250,
        252
      );

      document.setDrawColor(
        226,
        232,
        240
      );

      document.roundedRect(
        cardX,
        summaryTop,
        cardWidth,
        18,
        2,
        2,
        "FD"
      );

      document.setTextColor(
        100,
        116,
        139
      );

      document.setFont(
        "helvetica",
        "normal"
      );

      document.setFontSize(8);

      document.text(
        item.label,
        cardX + 4,
        summaryTop + 6
      );

      document.setTextColor(
        31,
        41,
        55
      );

      document.setFont(
        "helvetica",
        "bold"
      );

      document.setFontSize(13);

      document.text(
        String(item.value),
        cardX + 4,
        summaryTop + 14
      );
    }
  );

  const tableRows =
    tickets.map(
      (ticket) => [
        `#${ticket.id}`,
        ticket.title,
        ticket.category,
        ticket.priority,
        ticket.status,
        getTechnicianName(
          ticket.assignedTechnicianId,
          users
        ),
        formatDate(
          ticket.createdAt
        ),
      ]
    );

  autoTable(
    document,
    {
      startY: 75,

      head: [
        [
          "ID",
          "Chamado",
          "Categoria",
          "Prioridade",
          "Status",
          "Técnico",
          "Criado em",
        ],
      ],

      body: tableRows,

      theme: "grid",

      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 2.5,
        overflow: "linebreak",
        valign: "middle",
        textColor: [
          31,
          41,
          55,
        ],
        lineColor: [
          226,
          232,
          240,
        ],
        lineWidth: 0.2,
      },

      headStyles: {
        fillColor: [
          21,
          101,
          192,
        ],
        textColor: [
          255,
          255,
          255,
        ],
        fontStyle: "bold",
        halign: "left",
      },

      alternateRowStyles: {
        fillColor: [
          248,
          250,
          252,
        ],
      },

      columnStyles: {
        0: {
          cellWidth: 18,
        },

        1: {
          cellWidth: 65,
        },

        2: {
          cellWidth: 32,
        },

        3: {
          cellWidth: 25,
        },

        4: {
          cellWidth: 30,
        },

        5: {
          cellWidth: 45,
        },

        6: {
          cellWidth: 38,
        },
      },

      margin: {
        left:
          horizontalMargin,
        right:
          horizontalMargin,
        bottom: 17,
      },

      didDrawPage: () => {
        const currentPage =
          document.getNumberOfPages();

        document.setDrawColor(
          226,
          232,
          240
        );

        document.line(
          horizontalMargin,
          pageHeight - 12,
          pageWidth -
            horizontalMargin,
          pageHeight - 12
        );

        document.setFont(
          "helvetica",
          "normal"
        );

        document.setFontSize(8);

        document.setTextColor(
          100,
          116,
          139
        );

        document.text(
          "Gerado automaticamente pelo SupportDesk Pro",
          horizontalMargin,
          pageHeight - 7
        );

        document.text(
          `Página ${currentPage}`,
          pageWidth -
            horizontalMargin,
          pageHeight - 7,
          {
            align: "right",
          }
        );
      },
    }
  );

  document.save(
    createFileName()
  );
}