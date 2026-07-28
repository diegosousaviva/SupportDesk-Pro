import {
  useCallback,
  useMemo,
  useState,
} from "react";

import type {
  TicketSortDirection,
  TicketSortField,
} from "../components/tables/TicketTable";

import type {
  Ticket,
} from "../types/Ticket";

const PRIORITY_ORDER: Record<
  Ticket["priority"],
  number
> = {
  Baixa: 1,
  Média: 2,
  Alta: 3,
  Crítica: 4,
};

const STATUS_ORDER: Record<
  Ticket["status"],
  number
> = {
  Aberto: 1,
  "Em andamento": 2,
  Resolvido: 3,
};

type GetTechnicianName = (
  technicianId: number | null
) => string;

export interface UseTicketSortingResult {
  sortedTickets: Ticket[];

  sortField: TicketSortField;

  sortDirection: TicketSortDirection;

  handleSort: (
    field: TicketSortField
  ) => void;
}

export function useTicketSorting(
  tickets: readonly Ticket[],
  getTechnicianName: GetTechnicianName
): UseTicketSortingResult {
  const [sortField, setSortField] =
    useState<TicketSortField>("id");

  const [
    sortDirection,
    setSortDirection,
  ] = useState<TicketSortDirection>(
    "desc"
  );

  const sortedTickets = useMemo(() => {
    return [...tickets].sort(
      (firstTicket, secondTicket) => {
        let comparison = 0;

        if (sortField === "id") {
          comparison =
            firstTicket.id -
            secondTicket.id;
        }

        if (sortField === "title") {
          comparison =
            firstTicket.title.localeCompare(
              secondTicket.title,
              "pt-BR"
            );
        }

        if (sortField === "category") {
          comparison =
            firstTicket.category.localeCompare(
              secondTicket.category,
              "pt-BR"
            );
        }

        if (sortField === "technician") {
          const firstTechnicianName =
            getTechnicianName(
              firstTicket.assignedTechnicianId
            );

          const secondTechnicianName =
            getTechnicianName(
              secondTicket.assignedTechnicianId
            );

          comparison =
            firstTechnicianName.localeCompare(
              secondTechnicianName,
              "pt-BR"
            );
        }

        if (sortField === "priority") {
          comparison =
            PRIORITY_ORDER[
              firstTicket.priority
            ] -
            PRIORITY_ORDER[
              secondTicket.priority
            ];
        }

        if (sortField === "status") {
          comparison =
            STATUS_ORDER[
              firstTicket.status
            ] -
            STATUS_ORDER[
              secondTicket.status
            ];
        }

        return sortDirection === "asc"
          ? comparison
          : -comparison;
      }
    );
  }, [
    getTechnicianName,
    sortDirection,
    sortField,
    tickets,
  ]);

  const handleSort = useCallback(
    (field: TicketSortField): void => {
      if (sortField === field) {
        setSortDirection(
          (currentDirection) =>
            currentDirection === "asc"
              ? "desc"
              : "asc"
        );

        return;
      }

      setSortField(field);
      setSortDirection("asc");
    },
    [sortField]
  );

  return {
    sortedTickets,
    sortField,
    sortDirection,
    handleSort,
  };
}