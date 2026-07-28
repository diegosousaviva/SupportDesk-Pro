import {
  canViewTicket,
} from "./ticketAuthorization";

import type {
  Permission,
} from "./permissions";

import type {
  AuthUser,
} from "../services/authService";

import type {
  Ticket,
} from "../types/Ticket";

type CanFunction = (
  permission: Permission
) => boolean;

export function filterVisibleTickets(
  user: AuthUser | null,
  tickets: readonly Ticket[],
  can: CanFunction
): Ticket[] {
  if (!user) {
    return [];
  }

  return tickets.filter((ticket) =>
    canViewTicket(
      user,
      ticket,
      can
    )
  );
}