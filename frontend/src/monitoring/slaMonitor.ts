import {
  addNotification,
  getNotifications,
} from "../services/notificationService";

import {
  calculateTicketSla,
  getSlaRemainingLabel,
} from "../services/slaService";

import {
  getTickets,
} from "../services/ticketService";

import type {
  AppNotification,
  NotificationType,
} from "../types/Notification";

import type {
  Ticket,
} from "../types/Ticket";

const WARNING_NOTIFICATION_TYPE:
  NotificationType =
    "sla_warning";

const EXPIRED_NOTIFICATION_TYPE:
  NotificationType =
    "sla_expired";

function notificationAlreadyExists(
  ticketId: number,
  type: NotificationType
): boolean {
  return getNotifications().some(
    (notification) =>
      notification.ticketId ===
        ticketId &&
      notification.type === type
  );
}

function createSlaWarningNotification(
  ticket: Ticket
): AppNotification | null {
  if (
    notificationAlreadyExists(
      ticket.id,
      WARNING_NOTIFICATION_TYPE
    )
  ) {
    return null;
  }

  const sla =
    calculateTicketSla(
      ticket
    );

  return addNotification({
    title:
      "SLA próximo do vencimento",

    message:
      `O chamado #${ticket.id} — ${ticket.title} está próximo do vencimento. ${getSlaRemainingLabel(
        sla
      )}.`,

    type:
      WARNING_NOTIFICATION_TYPE,

    severity:
      "warning",

    read:
      false,

    ticketId:
      ticket.id,

    userId:
      ticket.assignedTechnicianId,
  });
}

function createSlaExpiredNotification(
  ticket: Ticket
): AppNotification | null {
  if (
    notificationAlreadyExists(
      ticket.id,
      EXPIRED_NOTIFICATION_TYPE
    )
  ) {
    return null;
  }

  const sla =
    calculateTicketSla(
      ticket
    );

  return addNotification({
    title:
      "SLA vencido",

    message:
      `O chamado #${ticket.id} — ${ticket.title} ultrapassou o prazo de atendimento. ${getSlaRemainingLabel(
        sla
      )}.`,

    type:
      EXPIRED_NOTIFICATION_TYPE,

    severity:
      "error",

    read:
      false,

    ticketId:
      ticket.id,

    userId:
      ticket.assignedTechnicianId,
  });
}

export interface SlaMonitorResult {
  checkedTickets: number;
  warningNotificationsCreated: number;
  expiredNotificationsCreated: number;
}

export function runSlaMonitor():
  SlaMonitorResult {
  const activeTickets =
    getTickets().filter(
      (ticket) =>
        ticket.status !==
        "Resolvido"
    );

  let warningNotificationsCreated =
    0;

  let expiredNotificationsCreated =
    0;

  activeTickets.forEach(
    (ticket) => {
      try {
        const sla =
          calculateTicketSla(
            ticket
          );

        if (
          sla.status ===
          "warning"
        ) {
          const notification =
            createSlaWarningNotification(
              ticket
            );

          if (notification) {
            warningNotificationsCreated +=
              1;
          }

          return;
        }

        if (
          sla.status ===
          "expired"
        ) {
          const notification =
            createSlaExpiredNotification(
              ticket
            );

          if (notification) {
            expiredNotificationsCreated +=
              1;
          }
        }
      } catch (error) {
        console.error(
          `Não foi possível verificar o SLA do chamado #${ticket.id}.`,
          error
        );
      }
    }
  );

  return {
    checkedTickets:
      activeTickets.length,

    warningNotificationsCreated,

    expiredNotificationsCreated,
  };
}