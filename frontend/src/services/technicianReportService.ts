import type {
  Ticket,
} from "../types/Ticket";

import type {
  User,
} from "../types/User";

import {
  calculateSlaSummary,
} from "./slaService";

export interface TechnicianReportItem {
  technicianId:
    number | null;

  technicianName:
    string;

  assignedTickets:
    number;

  resolvedTickets:
    number;

  pendingTickets:
    number;

  criticalTickets:
    number;

  resolutionRate:
    number;

  slaCompliance:
    number;
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

  if (!technician) {
    return `Técnico não encontrado (#${technicianId})`;
  }

  return technician.status ===
    "Inativo"
    ? `${technician.name} — Inativo`
    : technician.name;
}

export function createTechnicianReport(
  tickets:
    Ticket[],
  users:
    User[]
): TechnicianReportItem[] {
  const technicianMap =
    new Map<
      number | null,
      Ticket[]
    >();

  tickets.forEach(
    (ticket) => {
      const technicianId =
        ticket.assignedTechnicianId;

      const currentTickets =
        technicianMap.get(
          technicianId
        ) ?? [];

      technicianMap.set(
        technicianId,
        [
          ...currentTickets,
          ticket,
        ]
      );
    }
  );

  return Array.from(
    technicianMap.entries()
  )
    .map(
      ([
        technicianId,
        technicianTickets,
      ]) => {
        const assignedTickets =
          technicianTickets.length;

        const resolvedTickets =
          technicianTickets.filter(
            (ticket) =>
              ticket.status ===
              "Resolvido"
          ).length;

        const pendingTickets =
          technicianTickets.filter(
            (ticket) =>
              ticket.status !==
              "Resolvido"
          ).length;

        const criticalTickets =
          technicianTickets.filter(
            (ticket) =>
              ticket.priority ===
              "Crítica"
          ).length;

        const resolutionRate =
          assignedTickets ===
          0
            ? 0
            : Math.round(
                (
                  resolvedTickets /
                  assignedTickets
                ) * 100
              );

        const slaSummary =
          calculateSlaSummary(
            technicianTickets
          );

        return {
          technicianId,

          technicianName:
            getTechnicianName(
              technicianId,
              users
            ),

          assignedTickets,

          resolvedTickets,

          pendingTickets,

          criticalTickets,

          resolutionRate,

          slaCompliance:
            slaSummary.compliancePercentage,
        };
      }
    )
    .sort(
      (
        firstItem,
        secondItem
      ) => {
        if (
          firstItem.assignedTickets !==
          secondItem.assignedTickets
        ) {
          return (
            secondItem.assignedTickets -
            firstItem.assignedTickets
          );
        }

        return firstItem.technicianName.localeCompare(
          secondItem.technicianName,
          "pt-BR"
        );
      }
    );
}