import type { Ticket } from "../types/Ticket";
import type { AuthUser } from "../services/authService";
import { Permissions } from "./permissions";
import type { Permission } from "./permissions";

type CanFunction = (
  permission: Permission
) => boolean;

export function canViewTicket(
  user: AuthUser | null,
  ticket: Ticket,
  can: CanFunction
): boolean {
  if (!user) {
    return false;
  }

  if (can(Permissions.tickets.viewAll)) {
    return true;
  }

  if (
    can(Permissions.tickets.viewOwn) &&
    ticket.requesterUserId === user.id
  ) {
    return true;
  }

  if (
    can(Permissions.tickets.viewAssigned) &&
    ticket.assignedTechnicianId === user.id
  ) {
    return true;
  }

  return false;
}

export function canEditTicket(
  user: AuthUser | null,
  ticket: Ticket,
  can: CanFunction
): boolean {
  if (!user) {
    return false;
  }

  if (can(Permissions.tickets.edit)) {
    return true;
  }

  return (
    can(Permissions.tickets.editOwn) &&
    ticket.requesterUserId === user.id
  );
}

export function canDeleteTicket(
  user: AuthUser | null,
  can: CanFunction
): boolean {
  if (!user) {
    return false;
  }

  return can(Permissions.tickets.delete);
}

export function canAssignTicket(
  user: AuthUser | null,
  can: CanFunction
): boolean {
  if (!user) {
    return false;
  }

  return can(Permissions.tickets.assign);
}

export function canUpdateTicketStatus(
  user: AuthUser | null,
  ticket: Ticket,
  can: CanFunction
): boolean {
  if (!user) {
    return false;
  }

  if (can(Permissions.tickets.updateStatus)) {
    return true;
  }

  return ticket.assignedTechnicianId === user.id;
}

export function canCloseTicket(
  user: AuthUser | null,
  ticket: Ticket,
  can: CanFunction
): boolean {
  if (!user) {
    return false;
  }

  if (can(Permissions.tickets.close)) {
    return true;
  }

  return ticket.assignedTechnicianId === user.id;
}

export function canCommentTicket(
  user: AuthUser | null,
  ticket: Ticket,
  can: CanFunction
): boolean {
  if (!user) {
    return false;
  }

  if (can(Permissions.tickets.comment)) {
    return true;
  }

  return (
    ticket.requesterUserId === user.id ||
    ticket.assignedTechnicianId === user.id
  );
}