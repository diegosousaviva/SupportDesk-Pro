import type {
  Ticket,
} from "../types/Ticket";

import {
  calculateSlaSummary,
} from "./slaService";

export interface CategoryReportItem {
  category:
    string;

  totalTickets:
    number;

  openTickets:
    number;

  inProgressTickets:
    number;

  resolvedTickets:
    number;

  criticalTickets:
    number;

  resolutionRate:
    number;

  slaCompliance:
    number;
}

export function createCategoryReport(
  tickets:
    Ticket[]
): CategoryReportItem[] {
  const categoryMap =
    new Map<
      string,
      Ticket[]
    >();

  tickets.forEach(
    (ticket) => {
      const category =
        ticket.category.trim() ||
        "Sem categoria";

      const currentTickets =
        categoryMap.get(
          category
        ) ?? [];

      currentTickets.push(
        ticket
      );

      categoryMap.set(
        category,
        currentTickets
      );
    }
  );

  return Array.from(
    categoryMap.entries()
  )
    .map(
      ([
        category,
        categoryTickets,
      ]) => {
        const totalTickets =
          categoryTickets.length;

        const openTickets =
          categoryTickets.filter(
            (ticket) =>
              ticket.status ===
              "Aberto"
          ).length;

        const inProgressTickets =
          categoryTickets.filter(
            (ticket) =>
              ticket.status ===
              "Em andamento"
          ).length;

        const resolvedTickets =
          categoryTickets.filter(
            (ticket) =>
              ticket.status ===
              "Resolvido"
          ).length;

        const criticalTickets =
          categoryTickets.filter(
            (ticket) =>
              ticket.priority ===
              "Crítica"
          ).length;

        const resolutionRate =
          totalTickets ===
          0
            ? 0
            : Math.round(
                (
                  resolvedTickets /
                  totalTickets
                ) *
                  100
              );

        const slaSummary =
          calculateSlaSummary(
            categoryTickets
          );

        return {
          category,

          totalTickets,

          openTickets,

          inProgressTickets,

          resolvedTickets,

          criticalTickets,

          resolutionRate,

          slaCompliance:
            slaSummary.compliancePercentage,
        };
      }
    )
    .sort(
      (
        firstCategory,
        secondCategory
      ) => {
        if (
          firstCategory.totalTickets !==
          secondCategory.totalTickets
        ) {
          return (
            secondCategory.totalTickets -
            firstCategory.totalTickets
          );
        }

        return firstCategory.category.localeCompare(
          secondCategory.category,
          "pt-BR"
        );
      }
    );
}
