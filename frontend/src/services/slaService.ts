import type {
  Ticket,
  TicketPriority,
} from "../types/Ticket";

export type SlaStatus =
  | "within"
  | "warning"
  | "expired"
  | "completed_within"
  | "completed_expired";

export interface SlaResult {
  ticketId: number;

  targetHours: number;

  createdAt: string;

  dueDate: string;

  referenceDate: string;

  elapsedMilliseconds: number;

  remainingMilliseconds: number;

  progressPercentage: number;

  status: SlaStatus;

  expired: boolean;

  warning: boolean;

  completed: boolean;
}

export interface SlaSummary {
  totalTickets: number;

  activeTickets: number;

  completedTickets: number;

  withinSlaTickets: number;

  warningTickets: number;

  expiredTickets: number;

  completedWithinSlaTickets: number;

  completedExpiredTickets: number;

  compliancePercentage: number;
}

/*
 * Prazo padrão de resolução por prioridade.
 *
 * Crítica: 4 horas
 * Alta: 24 horas
 * Média: 48 horas
 * Baixa: 72 horas
 */
export const SLA_TARGET_HOURS: Record<
  TicketPriority,
  number
> = {
  Crítica: 4,
  Alta: 24,
  Média: 48,
  Baixa: 72,
};

/*
 * Um chamado entra em alerta quando já consumiu
 * 80% ou mais do prazo total do SLA.
 */
const SLA_WARNING_PERCENTAGE = 80;

function isValidDate(
  date: Date
): boolean {
  return !Number.isNaN(
    date.getTime()
  );
}

function clampPercentage(
  value: number
): number {
  return Math.min(
    100,
    Math.max(
      0,
      Math.round(value)
    )
  );
}

function hoursToMilliseconds(
  hours: number
): number {
  return (
    hours *
    60 *
    60 *
    1000
  );
}

export function getSlaTargetHours(
  priority: TicketPriority
): number {
  return SLA_TARGET_HOURS[
    priority
  ];
}

export function calculateSlaDueDate(
  createdAt: string,
  priority: TicketPriority
): string {
  const createdDate =
    new Date(createdAt);

  if (
    !isValidDate(
      createdDate
    )
  ) {
    throw new Error(
      "A data de criação do chamado é inválida."
    );
  }

  const targetHours =
    getSlaTargetHours(
      priority
    );

  const dueDate =
    new Date(
      createdDate.getTime() +
        hoursToMilliseconds(
          targetHours
        )
    );

  return dueDate.toISOString();
}

function getTicketReferenceDate(
  ticket: Ticket,
  currentDate: Date
): Date {
  if (
    ticket.status ===
      "Resolvido" &&
    ticket.closedAt
  ) {
    const closedDate =
      new Date(
        ticket.closedAt
      );

    if (
      isValidDate(
        closedDate
      )
    ) {
      return closedDate;
    }
  }

  return currentDate;
}

export function calculateTicketSla(
  ticket: Ticket,
  currentDate: Date =
    new Date()
): SlaResult {
  const createdDate =
    new Date(
      ticket.createdAt
    );

  if (
    !isValidDate(
      createdDate
    )
  ) {
    throw new Error(
      `O chamado #${ticket.id} possui uma data de criação inválida.`
    );
  }

  if (
    !isValidDate(
      currentDate
    )
  ) {
    throw new Error(
      "A data atual informada é inválida."
    );
  }

  const targetHours =
    getSlaTargetHours(
      ticket.priority
    );

  const targetMilliseconds =
    hoursToMilliseconds(
      targetHours
    );

  const dueDate =
    new Date(
      createdDate.getTime() +
        targetMilliseconds
    );

  const referenceDate =
    getTicketReferenceDate(
      ticket,
      currentDate
    );

  const elapsedMilliseconds =
    Math.max(
      0,
      referenceDate.getTime() -
        createdDate.getTime()
    );

  const remainingMilliseconds =
    dueDate.getTime() -
    referenceDate.getTime();

  const rawProgressPercentage =
    targetMilliseconds === 0
      ? 100
      : (
          elapsedMilliseconds /
          targetMilliseconds
        ) * 100;

  const progressPercentage =
    clampPercentage(
      rawProgressPercentage
    );

  const completed =
    ticket.status ===
    "Resolvido";

  const expired =
    referenceDate.getTime() >
    dueDate.getTime();

  const warning =
    !completed &&
    !expired &&
    rawProgressPercentage >=
      SLA_WARNING_PERCENTAGE;

  let status: SlaStatus;

  if (completed) {
    status = expired
      ? "completed_expired"
      : "completed_within";
  } else if (expired) {
    status = "expired";
  } else if (warning) {
    status = "warning";
  } else {
    status = "within";
  }

  return {
    ticketId:
      ticket.id,

    targetHours,

    createdAt:
      createdDate.toISOString(),

    dueDate:
      dueDate.toISOString(),

    referenceDate:
      referenceDate.toISOString(),

    elapsedMilliseconds,

    remainingMilliseconds,

    progressPercentage,

    status,

    expired,

    warning,

    completed,
  };
}

export function getSlaStatusLabel(
  status: SlaStatus
): string {
  switch (status) {
    case "within":
      return "Dentro do SLA";

    case "warning":
      return "Próximo do vencimento";

    case "expired":
      return "SLA vencido";

    case "completed_within":
      return "Resolvido dentro do SLA";

    case "completed_expired":
      return "Resolvido fora do SLA";
  }
}

export function formatSlaDuration(
  milliseconds: number
): string {
  const absoluteMilliseconds =
    Math.abs(
      milliseconds
    );

  const totalMinutes =
    Math.floor(
      absoluteMilliseconds /
        (1000 * 60)
    );

  const days =
    Math.floor(
      totalMinutes /
        (60 * 24)
    );

  const hours =
    Math.floor(
      (
        totalMinutes %
        (60 * 24)
      ) / 60
    );

  const minutes =
    totalMinutes % 60;

  const parts: string[] =
    [];

  if (days > 0) {
    parts.push(
      `${days}d`
    );
  }

  if (
    hours > 0 ||
    days > 0
  ) {
    parts.push(
      `${hours}h`
    );
  }

  parts.push(
    `${minutes}min`
  );

  return parts.join(" ");
}

export function getSlaRemainingLabel(
  sla: SlaResult
): string {
  if (
    sla.completed
  ) {
    return sla.expired
      ? `Resolvido com ${formatSlaDuration(
          sla.remainingMilliseconds
        )} de atraso`
      : `Resolvido com ${formatSlaDuration(
          sla.remainingMilliseconds
        )} restantes`;
  }

  if (
    sla.expired
  ) {
    return `Vencido há ${formatSlaDuration(
      sla.remainingMilliseconds
    )}`;
  }

  return `Restam ${formatSlaDuration(
    sla.remainingMilliseconds
  )}`;
}

export function calculateSlaSummary(
  tickets: Ticket[],
  currentDate: Date =
    new Date()
): SlaSummary {
  const results =
    tickets.map(
      (ticket) =>
        calculateTicketSla(
          ticket,
          currentDate
        )
    );

  const activeTickets =
    results.filter(
      (result) =>
        !result.completed
    ).length;

  const completedTickets =
    results.filter(
      (result) =>
        result.completed
    ).length;

  const withinSlaTickets =
    results.filter(
      (result) =>
        result.status ===
        "within"
    ).length;

  const warningTickets =
    results.filter(
      (result) =>
        result.status ===
        "warning"
    ).length;

  const expiredTickets =
    results.filter(
      (result) =>
        result.status ===
        "expired"
    ).length;

  const completedWithinSlaTickets =
    results.filter(
      (result) =>
        result.status ===
        "completed_within"
    ).length;

  const completedExpiredTickets =
    results.filter(
      (result) =>
        result.status ===
        "completed_expired"
    ).length;

  const evaluatedTickets =
    completedWithinSlaTickets +
    completedExpiredTickets;

  const compliancePercentage =
    evaluatedTickets === 0
      ? 0
      : Math.round(
          (
            completedWithinSlaTickets /
            evaluatedTickets
          ) * 100
        );

  return {
    totalTickets:
      results.length,

    activeTickets,

    completedTickets,

    withinSlaTickets,

    warningTickets,

    expiredTickets,

    completedWithinSlaTickets,

    completedExpiredTickets,

    compliancePercentage,
  };
}