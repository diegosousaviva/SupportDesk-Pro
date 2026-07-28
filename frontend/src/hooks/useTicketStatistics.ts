import { useMemo } from "react";

import type { Ticket } from "../types/Ticket";

export interface TicketStatistics {
  totalTickets: number;

  openTickets: number;

  inProgressTickets: number;

  resolvedTickets: number;
}

export function useTicketStatistics(
  tickets: readonly Ticket[]
): TicketStatistics {
  return useMemo(() => {
    return {
      totalTickets: tickets.length,

      openTickets: tickets.filter(
        (ticket) =>
          ticket.status === "Aberto"
      ).length,

      inProgressTickets:
        tickets.filter(
          (ticket) =>
            ticket.status ===
            "Em andamento"
        ).length,

      resolvedTickets:
        tickets.filter(
          (ticket) =>
            ticket.status ===
            "Resolvido"
        ).length,
    };
  }, [tickets]);
}