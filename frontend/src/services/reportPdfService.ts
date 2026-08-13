import {
  jsPDF,
} from "jspdf";

import {
  autoTable,
} from "jspdf-autotable";

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
  calculateSlaSummary,
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

interface ReportPdfSummary {
  totalTickets: number;

  openTickets: number;

  inProgressTickets: number;

  resolvedTickets: number;

  criticalTickets: number;
}

interface ExportTicketsToPdfParams {
  tickets:
    Ticket[];

  users:
    User[];

  inventoryItems:
    InventoryItem[];

  stores:
    Store[];

  summary:
    ReportPdfSummary;
}

function getTechnicianName(
  technicianId:
    number | null,
  users:
    User[]
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

  return (
    technician?.name ??
    `Técnico não encontrado (#${technicianId})`
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
      dateStyle:
        "short",

      timeStyle:
        "short",
    }
  ).format(
    date
  );
}

function formatCurrentDate():
  string {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle:
        "long",

      timeStyle:
        "short",
    }
  ).format(
    new Date()
  );
}

function createFileName():
  string {
  const currentDate =
    new Date()
      .toISOString()
      .slice(
        0,
        10
      );

  return `relatorio-chamados-${currentDate}.pdf`;
}

export function exportTicketsToPdf({
  tickets,
  users,
  inventoryItems,
  stores,
  summary,
}: ExportTicketsToPdfParams): void {
  const document =
    new jsPDF({
      orientation:
        "landscape",

      unit:
        "mm",

      format:
        "a4",
    });

  const pageWidth =
    document.internal.pageSize.getWidth();

  const pageHeight =
    document.internal.pageSize.getHeight();

  const horizontalMargin =
    14;

  const slaSummary =
    calculateSlaSummary(
      tickets
    );

  const technicianReport =
    createTechnicianReport(
      tickets,
      users
    );

  const storeReport =
    createStoreReport(
      tickets,
      inventoryItems,
      stores
    );

  const categoryReport =
    createCategoryReport(
      tickets
    );

  /*
   * Cabeçalho principal
   */
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

  document.setFontSize(
    18
  );

  document.text(
    "SupportDesk Pro",
    horizontalMargin,
    11
  );

  document.setFont(
    "helvetica",
    "normal"
  );

  document.setFontSize(
    10
  );

  document.text(
    "Central de Suporte",
    horizontalMargin,
    17
  );

  /*
   * Título
   */
  document.setTextColor(
    31,
    41,
    55
  );

  document.setFont(
    "helvetica",
    "bold"
  );

  document.setFontSize(
    17
  );

  document.text(
    "Relatório de chamados",
    horizontalMargin,
    37
  );

  document.setFont(
    "helvetica",
    "normal"
  );

  document.setFontSize(
    9
  );

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

  /*
   * Resumo geral
   */
  const summaryTop =
    50;

  const cardGap =
    3;

  const availableWidth =
    pageWidth -
    horizontalMargin *
      2;

  const summaryItems = [
    {
      label:
        "Total",

      value:
        summary.totalTickets,
    },

    {
      label:
        "Abertos",

      value:
        summary.openTickets,
    },

    {
      label:
        "Em andamento",

      value:
        summary.inProgressTickets,
    },

    {
      label:
        "Resolvidos",

      value:
        summary.resolvedTickets,
    },

    {
      label:
        "Críticos",

      value:
        summary.criticalTickets,
    },

    {
      label:
        "Conformidade SLA",

      value:
        `${slaSummary.compliancePercentage}%`,
    },
  ];

  const cardWidth =
    (
      availableWidth -
      cardGap *
        (
          summaryItems.length -
          1
        )
    ) /
    summaryItems.length;

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

      document.setFontSize(
        7.5
      );

      document.text(
        item.label,
        cardX + 3,
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

      document.setFontSize(
        12
      );

      document.text(
        String(
          item.value
        ),
        cardX + 3,
        summaryTop + 14
      );
    }
  );

  /*
   * Resumo de SLA
   */
  document.setFont(
    "helvetica",
    "normal"
  );

  document.setFontSize(
    8
  );

  document.setTextColor(
    100,
    116,
    139
  );

  document.text(
    [
      `Dentro do SLA: ${slaSummary.withinSlaTickets}`,
      `Próximos do vencimento: ${slaSummary.warningTickets}`,
      `SLA vencido: ${slaSummary.expiredTickets}`,
      `Resolvidos no prazo: ${slaSummary.completedWithinSlaTickets}`,
      `Resolvidos fora do prazo: ${slaSummary.completedExpiredTickets}`,
    ].join(
      "   |   "
    ),
    horizontalMargin,
    73
  );

  /*
   * Tabela detalhada de chamados
   */
  const ticketTableRows =
    tickets.map(
      (ticket) => {
        const sla =
          calculateTicketSla(
            ticket
          );

        return [
          `#${ticket.id}`,

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

          `${sla.targetHours}h`,

          formatDate(
            sla.dueDate
          ),
        ];
      }
    );

  autoTable(
    document,
    {
      startY:
        79,

      head: [
        [
          "ID",
          "Chamado",
          "Categoria",
          "Prioridade",
          "Status",
          "Técnico",
          "SLA",
          "Situação do SLA",
          "Prazo",
          "Vencimento",
        ],
      ],

      body:
        ticketTableRows,

      theme:
        "grid",

      styles: {
        font:
          "helvetica",

        fontSize:
          6.8,

        cellPadding:
          2,

        overflow:
          "linebreak",

        valign:
          "middle",

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

        lineWidth:
          0.2,
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

        fontStyle:
          "bold",

        halign:
          "left",

        fontSize:
          6.5,
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
          cellWidth:
            13,
        },

        1: {
          cellWidth:
            42,
        },

        2: {
          cellWidth:
            24,
        },

        3: {
          cellWidth:
            18,
        },

        4: {
          cellWidth:
            22,
        },

        5: {
          cellWidth:
            31,
        },

        6: {
          cellWidth:
            34,
        },

        7: {
          cellWidth:
            42,
        },

        8: {
          cellWidth:
            16,
        },

        9: {
          cellWidth:
            27,
        },
      },

      margin: {
        left:
          horizontalMargin,

        right:
          horizontalMargin,

        bottom:
          17,
      },

      didDrawPage:
        () => {
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

          document.setFontSize(
            8
          );

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
              align:
                "right",
            }
          );
        },
    }
  );

  /*
   * Nova página:
   * desempenho por técnico
   */
  document.addPage(
    "a4",
    "landscape"
  );

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

  document.setFontSize(
    18
  );

  document.text(
    "SupportDesk Pro",
    horizontalMargin,
    11
  );

  document.setFont(
    "helvetica",
    "normal"
  );

  document.setFontSize(
    10
  );

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

  document.setFontSize(
    17
  );

  document.text(
    "Desempenho por Técnico",
    horizontalMargin,
    38
  );

  document.setFont(
    "helvetica",
    "normal"
  );

  document.setFontSize(
    9
  );

  document.setTextColor(
    100,
    116,
    139
  );

  document.text(
    "Resumo de produtividade, volume de chamados e conformidade de SLA por responsável.",
    horizontalMargin,
    44
  );

  const technicianRows =
    technicianReport.map(
      (technician) => [
        technician.technicianName,

        technician.assignedTickets,

        technician.resolvedTickets,

        technician.pendingTickets,

        technician.criticalTickets,

        `${technician.resolutionRate}%`,

        `${technician.slaCompliance}%`,
      ]
    );

  autoTable(
    document,
    {
      startY:
        52,

      head: [
        [
          "Técnico",
          "Atribuídos",
          "Resolvidos",
          "Pendentes",
          "Críticos",
          "Taxa de resolução",
          "Conformidade SLA",
        ],
      ],

      body:
        technicianRows,

      theme:
        "grid",

      styles: {
        font:
          "helvetica",

        fontSize:
          8,

        cellPadding:
          3,

        valign:
          "middle",

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

        lineWidth:
          0.2,
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

        fontStyle:
          "bold",

        halign:
          "center",
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
          cellWidth:
            70,

          halign:
            "left",
        },

        1: {
          cellWidth:
            28,

          halign:
            "center",
        },

        2: {
          cellWidth:
            28,

          halign:
            "center",
        },

        3: {
          cellWidth:
            28,

          halign:
            "center",
        },

        4: {
          cellWidth:
            25,

          halign:
            "center",
        },

        5: {
          cellWidth:
            40,

          halign:
            "center",
        },

        6: {
          cellWidth:
            40,

          halign:
            "center",
        },
      },

      margin: {
        left:
          horizontalMargin,

        right:
          horizontalMargin,

        bottom:
          17,
      },

      didDrawPage:
        () => {
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

          document.setFontSize(
            8
          );

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
              align:
                "right",
            }
          );
        },
    }
  );

  /*
   * Nova página:
   * desempenho por loja
   */
  document.addPage(
    "a4",
    "landscape"
  );

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

  document.setFontSize(
    18
  );

  document.text(
    "SupportDesk Pro",
    horizontalMargin,
    11
  );

  document.setFont(
    "helvetica",
    "normal"
  );

  document.setFontSize(
    10
  );

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

  document.setFontSize(
    17
  );

  document.text(
    "Desempenho por Loja",
    horizontalMargin,
    38
  );

  document.setFont(
    "helvetica",
    "normal"
  );

  document.setFontSize(
    9
  );

  document.setTextColor(
    100,
    116,
    139
  );

  document.text(
    "Resumo do volume de chamados, resolução e conformidade de SLA por loja.",
    horizontalMargin,
    44
  );

  const storeRows =
    storeReport.map(
      (store) => [
        store.storeCode,

        store.storeName,

        store.totalTickets,

        store.openTickets,

        store.inProgressTickets,

        store.resolvedTickets,

        store.criticalTickets,

        `${store.resolutionRate}%`,

        `${store.slaCompliance}%`,
      ]
    );

  autoTable(
    document,
    {
      startY:
        52,

      head: [
        [
          "Código",
          "Loja",
          "Total",
          "Abertos",
          "Em andamento",
          "Resolvidos",
          "Críticos",
          "Taxa de resolução",
          "Conformidade SLA",
        ],
      ],

      body:
        storeRows,

      theme:
        "grid",

      styles: {
        font:
          "helvetica",

        fontSize:
          8,

        cellPadding:
          3,

        valign:
          "middle",

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

        lineWidth:
          0.2,
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

        fontStyle:
          "bold",

        halign:
          "center",

        fontSize:
          7.5,
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
          cellWidth:
            24,

          halign:
            "center",
        },

        1: {
          cellWidth:
            55,

          halign:
            "left",
        },

        2: {
          cellWidth:
            22,

          halign:
            "center",
        },

        3: {
          cellWidth:
            22,

          halign:
            "center",
        },

        4: {
          cellWidth:
            31,

          halign:
            "center",
        },

        5: {
          cellWidth:
            26,

          halign:
            "center",
        },

        6: {
          cellWidth:
            22,

          halign:
            "center",
        },

        7: {
          cellWidth:
            36,

          halign:
            "center",
        },

        8: {
          cellWidth:
            36,

          halign:
            "center",
        },
      },

      margin: {
        left:
          horizontalMargin,

        right:
          horizontalMargin,

        bottom:
          17,
      },

      didDrawPage:
        () => {
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

          document.setFontSize(
            8
          );

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
              align:
                "right",
            }
          );
        },
    }
  );

  /*
   * Nova página:
   * desempenho por categoria
   */
  document.addPage(
    "a4",
    "landscape"
  );

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

  document.setFontSize(
    18
  );

  document.text(
    "SupportDesk Pro",
    horizontalMargin,
    11
  );

  document.setFont(
    "helvetica",
    "normal"
  );

  document.setFontSize(
    10
  );

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

  document.setFontSize(
    17
  );

  document.text(
    "Desempenho por Categoria",
    horizontalMargin,
    38
  );

  document.setFont(
    "helvetica",
    "normal"
  );

  document.setFontSize(
    9
  );

  document.setTextColor(
    100,
    116,
    139
  );

  document.text(
    "Resumo do volume de chamados, resolução e conformidade de SLA por categoria.",
    horizontalMargin,
    44
  );

  const categoryRows =
    categoryReport.map(
      (category) => [
        category.category,

        category.totalTickets,

        category.openTickets,

        category.inProgressTickets,

        category.resolvedTickets,

        category.criticalTickets,

        `${category.resolutionRate}%`,

        `${category.slaCompliance}%`,
      ]
    );

  autoTable(
    document,
    {
      startY:
        52,

      head: [
        [
          "Categoria",
          "Total",
          "Abertos",
          "Em andamento",
          "Resolvidos",
          "Críticos",
          "Taxa de resolução",
          "Conformidade SLA",
        ],
      ],

      body:
        categoryRows,

      theme:
        "grid",

      styles: {
        font:
          "helvetica",

        fontSize:
          8,

        cellPadding:
          3,

        valign:
          "middle",

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

        lineWidth:
          0.2,
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

        fontStyle:
          "bold",

        halign:
          "center",

        fontSize:
          7.5,
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
          cellWidth:
            65,

          halign:
            "left",
        },

        1: {
          cellWidth:
            24,

          halign:
            "center",
        },

        2: {
          cellWidth:
            24,

          halign:
            "center",
        },

        3: {
          cellWidth:
            34,

          halign:
            "center",
        },

        4: {
          cellWidth:
            28,

          halign:
            "center",
        },

        5: {
          cellWidth:
            24,

          halign:
            "center",
        },

        6: {
          cellWidth:
            40,

          halign:
            "center",
        },

        7: {
          cellWidth:
            40,

          halign:
            "center",
        },
      },

      margin: {
        left:
          horizontalMargin,

        right:
          horizontalMargin,

        bottom:
          17,
      },

      didDrawPage:
        () => {
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

          document.setFontSize(
            8
          );

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
              align:
                "right",
            }
          );
        },
    }
  );

  document.save(
    createFileName()
  );
}