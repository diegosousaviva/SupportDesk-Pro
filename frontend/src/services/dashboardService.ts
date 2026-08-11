import type {
  DashboardPeriod,
  DashboardStoreFilter,
} from "../components/dashboard/DashboardFilters";

import type {
  InventoryItem,
} from "../types/InventoryItem";

import type {
  Store,
  StoreStatus,
} from "../types/Store";

import type {
  Ticket,
} from "../types/Ticket";

import type {
  User,
} from "../types/User";

import {
  calculateSlaSummary,
  calculateTicketSla,
  SLA_TARGET_HOURS,
} from "./slaService";

export interface CategoryChartItem {
  [key: string]:
    | string
    | number;

  category: string;

  quantity: number;
}

export interface TechnicianChartItem {
  [key: string]:
    | string
    | number;

  technician: string;

  quantity: number;
}

export interface MonthlyChartItem {
  [key: string]:
    | string
    | number;

  month: string;

  quantity: number;
}

export interface StoreInventoryChartItem {
  storeId: number;

  storeCode: string;

  storeName: string;

  storeStatus: StoreStatus;

  quantity: number;
}

export interface TechnicianRankingItem {
  technicianId:
    number | null;

  technicianName:
    string;

  assignedTickets:
    number;

  resolvedTickets:
    number;

  resolutionRate:
    number;
}

export type SlaHealth =
  | "Excelente"
  | "Atenção"
  | "Crítico";

export interface DashboardSlaMetrics {
  targetHoursByPriority:
    typeof SLA_TARGET_HOURS;

  evaluatedTickets:
    number;

  withinSlaTickets:
    number;

  warningTickets:
    number;

  expiredTickets:
    number;

  completedWithinSlaTickets:
    number;

  completedExpiredTickets:
    number;

  slaCompliance:
    number;

  slaViolation:
    number;

  averageResolutionHours:
    number;

  fastestResolutionHours:
    number;

  slowestResolutionHours:
    number;

  health:
    SlaHealth;
}

export interface DashboardMainMetrics {
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

  highPriorityTickets:
    number;

  mediumPriorityTickets:
    number;

  lowPriorityTickets:
    number;

  resolvedPercentage:
    number;
}

export interface DashboardExecutiveMetrics {
  totalUsers:
    number;

  activeTechnicians:
    number;

  criticalTickets:
    number;

  unassignedTickets:
    number;

  resolutionRate:
    number;

  averageResolutionTime:
    number;
}

export interface DashboardInventoryMetrics {
  totalItems:
    number;

  inUseItems:
    number;

  inStockItems:
    number;

  maintenanceItems:
    number;

  loanedItems:
    number;

  reservedItems:
    number;

  discardedItems:
    number;

  decommissionedItems:
    number;
}

export interface DashboardData {
  filteredTickets:
    Ticket[];

  filteredInventoryItems:
    InventoryItem[];

  recentTickets:
    Ticket[];

  mainMetrics:
    DashboardMainMetrics;

  executiveMetrics:
    DashboardExecutiveMetrics;

  inventoryMetrics:
    DashboardInventoryMetrics;

  storeInventoryData:
    StoreInventoryChartItem[];

  slaMetrics:
    DashboardSlaMetrics;

  categoryChartData:
    CategoryChartItem[];

  technicianChartData:
    TechnicianChartItem[];

  monthlyChartData:
    MonthlyChartItem[];

  technicianRanking:
    TechnicianRankingItem[];
}

interface CreateDashboardDataParams {
  tickets:
    Ticket[];

  users:
    User[];

  inventoryItems:
    InventoryItem[];

  stores:
    Store[];

  period:
    DashboardPeriod;

  /*
   * Temporariamente opcional para manter compatibilidade
   * até o DashboardPage ser atualizado na próxima etapa.
   */
  storeFilter?:
    DashboardStoreFilter;
}

function startOfDay(
  date: Date
): Date {
  const normalizedDate =
    new Date(
      date
    );

  normalizedDate.setHours(
    0,
    0,
    0,
    0
  );

  return normalizedDate;
}

function getPeriodStartDate(
  period: DashboardPeriod
): Date {
  const startDate =
    startOfDay(
      new Date()
    );

  switch (period) {
    case "today":
      return startDate;

    case "7_days":
      startDate.setDate(
        startDate.getDate() -
          6
      );

      return startDate;

    case "30_days":
      startDate.setDate(
        startDate.getDate() -
          29
      );

      return startDate;

    case "90_days":
      startDate.setDate(
        startDate.getDate() -
          89
      );

      return startDate;

    case "this_month":
      startDate.setDate(
        1
      );

      return startDate;

    case "this_year":
      startDate.setMonth(
        0,
        1
      );

      return startDate;
  }
}

function isValidDate(
  date: Date
): boolean {
  return !Number.isNaN(
    date.getTime()
  );
}

function roundToOneDecimal(
  value: number
): number {
  return (
    Math.round(
      value * 10
    ) / 10
  );
}

function getSelectedStoreId(
  storeFilter:
    DashboardStoreFilter
): number | null {
  if (
    storeFilter ===
    "all"
  ) {
    return null;
  }

  const storeId =
    Number(
      storeFilter
    );

  if (
    !Number.isInteger(
      storeId
    ) ||
    storeId <= 0
  ) {
    return null;
  }

  return storeId;
}

function filterInventoryByStore(
  inventoryItems:
    InventoryItem[],
  storeFilter:
    DashboardStoreFilter
): InventoryItem[] {
  const selectedStoreId =
    getSelectedStoreId(
      storeFilter
    );

  if (
    selectedStoreId ===
    null
  ) {
    return [
      ...inventoryItems,
    ];
  }

  return inventoryItems.filter(
    (item) =>
      item.storeId ===
      selectedStoreId
  );
}

function filterTicketsByStore(
  tickets:
    Ticket[],
  inventoryItems:
    InventoryItem[],
  storeFilter:
    DashboardStoreFilter
): Ticket[] {
  const selectedStoreId =
    getSelectedStoreId(
      storeFilter
    );

  if (
    selectedStoreId ===
    null
  ) {
    return [
      ...tickets,
    ];
  }

  const inventoryItemIds =
    new Set(
      inventoryItems
        .filter(
          (item) =>
            item.storeId ===
            selectedStoreId
        )
        .map(
          (item) =>
            item.id
        )
    );

  return tickets.filter(
    (ticket) =>
      ticket.inventoryItemId !==
        null &&
      inventoryItemIds.has(
        ticket.inventoryItemId
      )
  );
}

function filterTicketsByPeriod(
  tickets: Ticket[],
  period: DashboardPeriod
): Ticket[] {
  const startDate =
    getPeriodStartDate(
      period
    );

  return tickets.filter(
    (ticket) => {
      const createdAt =
        new Date(
          ticket.createdAt
        );

      return (
        isValidDate(
          createdAt
        ) &&
        createdAt >=
          startDate
      );
    }
  );
}

function calculateMainMetrics(
  tickets: Ticket[]
): DashboardMainMetrics {
  const totalTickets =
    tickets.length;

  const openTickets =
    tickets.filter(
      (ticket) =>
        ticket.status ===
        "Aberto"
    ).length;

  const inProgressTickets =
    tickets.filter(
      (ticket) =>
        ticket.status ===
        "Em andamento"
    ).length;

  const resolvedTickets =
    tickets.filter(
      (ticket) =>
        ticket.status ===
        "Resolvido"
    ).length;

  const criticalTickets =
    tickets.filter(
      (ticket) =>
        ticket.priority ===
        "Crítica"
    ).length;

  const highPriorityTickets =
    tickets.filter(
      (ticket) =>
        ticket.priority ===
        "Alta"
    ).length;

  const mediumPriorityTickets =
    tickets.filter(
      (ticket) =>
        ticket.priority ===
        "Média"
    ).length;

  const lowPriorityTickets =
    tickets.filter(
      (ticket) =>
        ticket.priority ===
        "Baixa"
    ).length;

  const resolvedPercentage =
    totalTickets ===
    0
      ? 0
      : Math.round(
          (
            resolvedTickets /
            totalTickets
          ) * 100
        );

  return {
    totalTickets,

    openTickets,

    inProgressTickets,

    resolvedTickets,

    criticalTickets,

    highPriorityTickets,

    mediumPriorityTickets,

    lowPriorityTickets,

    resolvedPercentage,
  };
}

function calculateInventoryMetrics(
  inventoryItems:
    InventoryItem[]
): DashboardInventoryMetrics {
  const totalItems =
    inventoryItems.length;

  const inUseItems =
    inventoryItems.filter(
      (item) =>
        item.status ===
        "Em uso"
    ).length;

  const inStockItems =
    inventoryItems.filter(
      (item) =>
        item.status ===
        "Em estoque"
    ).length;

  const maintenanceItems =
    inventoryItems.filter(
      (item) =>
        item.status ===
        "Em manutenção"
    ).length;

  const loanedItems =
    inventoryItems.filter(
      (item) =>
        item.status ===
        "Emprestado"
    ).length;

  const reservedItems =
    inventoryItems.filter(
      (item) =>
        item.status ===
        "Reserva"
    ).length;

  const discardedItems =
    inventoryItems.filter(
      (item) =>
        item.status ===
        "Descartado"
    ).length;

  const decommissionedItems =
    inventoryItems.filter(
      (item) =>
        item.status ===
        "Baixado"
    ).length;

  return {
    totalItems,

    inUseItems,

    inStockItems,

    maintenanceItems,

    loanedItems,

    reservedItems,

    discardedItems,

    decommissionedItems,
  };
}
function getResolutionDurationHours(
  ticket: Ticket
): number | null {
  if (
    ticket.status !==
      "Resolvido" ||
    ticket.closedAt ===
      null
  ) {
    return null;
  }

  const createdAt =
    new Date(
      ticket.createdAt
    ).getTime();

  const closedAt =
    new Date(
      ticket.closedAt
    ).getTime();

  if (
    Number.isNaN(
      createdAt
    ) ||
    Number.isNaN(
      closedAt
    ) ||
    closedAt <
      createdAt
  ) {
    return null;
  }

  return (
    (
      closedAt -
      createdAt
    ) /
    (
      1000 *
      60 *
      60
    )
  );
}

function calculateAverageResolutionTime(
  tickets: Ticket[]
): number {
  const durations =
    tickets
      .map(
        getResolutionDurationHours
      )
      .filter(
        (
          duration
        ): duration is number =>
          duration !==
          null
      );

  if (
    durations.length ===
    0
  ) {
    return 0;
  }

  const totalHours =
    durations.reduce(
      (
        total,
        duration
      ) =>
        total +
        duration,
      0
    );

  return roundToOneDecimal(
    totalHours /
      durations.length
  );
}

function calculateExecutiveMetrics(
  tickets: Ticket[],
  users: User[]
): DashboardExecutiveMetrics {
  const totalUsers =
    users.length;

  const activeTechnicians =
    users.filter(
      (user) =>
        user.role ===
          "Técnico" &&
        user.status ===
          "Ativo"
    ).length;

  const criticalTickets =
    tickets.filter(
      (ticket) =>
        ticket.priority ===
        "Crítica"
    ).length;

  const unassignedTickets =
    tickets.filter(
      (ticket) =>
        ticket.assignedTechnicianId ===
          null &&
        ticket.status !==
          "Resolvido"
    ).length;

  const resolvedTickets =
    tickets.filter(
      (ticket) =>
        ticket.status ===
        "Resolvido"
    ).length;

  const resolutionRate =
    tickets.length ===
    0
      ? 0
      : Math.round(
          (
            resolvedTickets /
            tickets.length
          ) * 100
        );

  return {
    totalUsers,

    activeTechnicians,

    criticalTickets,

    unassignedTickets,

    resolutionRate,

    averageResolutionTime:
      calculateAverageResolutionTime(
        tickets
      ),
  };
}

function calculateSlaHealth(
  slaCompliance: number
): SlaHealth {
  if (
    slaCompliance >=
    90
  ) {
    return "Excelente";
  }

  if (
    slaCompliance >=
    70
  ) {
    return "Atenção";
  }

  return "Crítico";
}

function calculateSlaMetrics(
  tickets: Ticket[]
): DashboardSlaMetrics {
  const slaSummary =
    calculateSlaSummary(
      tickets
    );

  const completedDurations =
    tickets
      .filter(
        (ticket) =>
          ticket.status ===
          "Resolvido"
      )
      .map(
        (ticket) => {
          const sla =
            calculateTicketSla(
              ticket
            );

          return (
            sla.elapsedMilliseconds /
            (
              1000 *
              60 *
              60
            )
          );
        }
      )
      .filter(
        (duration) =>
          Number.isFinite(
            duration
          ) &&
          duration >=
            0
      );

  const averageResolutionHours =
    completedDurations.length ===
    0
      ? 0
      : roundToOneDecimal(
          completedDurations.reduce(
            (
              total,
              duration
            ) =>
              total +
              duration,
            0
          ) /
            completedDurations.length
        );

  const fastestResolutionHours =
    completedDurations.length ===
    0
      ? 0
      : roundToOneDecimal(
          Math.min(
            ...completedDurations
          )
        );

  const slowestResolutionHours =
    completedDurations.length ===
    0
      ? 0
      : roundToOneDecimal(
          Math.max(
            ...completedDurations
          )
        );

  const slaViolation =
    slaSummary.completedTickets ===
    0
      ? 0
      : 100 -
        slaSummary.compliancePercentage;

  return {
    targetHoursByPriority: {
      ...SLA_TARGET_HOURS,
    },

    evaluatedTickets:
      slaSummary.completedTickets,

    withinSlaTickets:
      slaSummary.withinSlaTickets,

    warningTickets:
      slaSummary.warningTickets,

    expiredTickets:
      slaSummary.expiredTickets,

    completedWithinSlaTickets:
      slaSummary.completedWithinSlaTickets,

    completedExpiredTickets:
      slaSummary.completedExpiredTickets,

    slaCompliance:
      slaSummary.compliancePercentage,

    slaViolation,

    averageResolutionHours,

    fastestResolutionHours,

    slowestResolutionHours,

    health:
      calculateSlaHealth(
        slaSummary.compliancePercentage
      ),
  };
}

function createCategoryChartData(
  tickets: Ticket[]
): CategoryChartItem[] {
  const categoryTotals =
    new Map<
      string,
      number
    >();

  tickets.forEach(
    (ticket) => {
      const category =
        ticket.category.trim() ||
        "Sem categoria";

      categoryTotals.set(
        category,
        (
          categoryTotals.get(
            category
          ) ??
          0
        ) + 1
      );
    }
  );

  return Array.from(
    categoryTotals.entries()
  )
    .map(
      ([
        category,
        quantity,
      ]) => ({
        category,
        quantity,
      })
    )
    .sort(
      (
        firstItem,
        secondItem
      ) => {
        if (
          firstItem.quantity !==
          secondItem.quantity
        ) {
          return (
            secondItem.quantity -
            firstItem.quantity
          );
        }

        return firstItem.category.localeCompare(
          secondItem.category,
          "pt-BR"
        );
      }
    );
}

function getTechnicianName(
  technicianId:
    number | null,
  users: User[]
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

  return (
    technician.status ===
    "Inativo"
      ? `${technician.name} — Inativo`
      : technician.name
  );
}

function createTechnicianChartData(
  tickets: Ticket[],
  users: User[]
): TechnicianChartItem[] {
  const technicianTotals =
    new Map<
      string,
      number
    >();

  tickets.forEach(
    (ticket) => {
      const technicianName =
        getTechnicianName(
          ticket.assignedTechnicianId,
          users
        );

      technicianTotals.set(
        technicianName,
        (
          technicianTotals.get(
            technicianName
          ) ??
          0
        ) + 1
      );
    }
  );

  return Array.from(
    technicianTotals.entries()
  )
    .map(
      ([
        technician,
        quantity,
      ]) => ({
        technician,
        quantity,
      })
    )
    .sort(
      (
        firstItem,
        secondItem
      ) => {
        if (
          firstItem.quantity !==
          secondItem.quantity
        ) {
          return (
            secondItem.quantity -
            firstItem.quantity
          );
        }

        return firstItem.technician.localeCompare(
          secondItem.technician,
          "pt-BR"
        );
      }
    );
}
function createMonthlyChartData(
  tickets: Ticket[]
): MonthlyChartItem[] {
  const currentDate =
    new Date();

  const months =
    Array.from(
      {
        length: 6,
      },
      (
        _item,
        index
      ) => {
        const monthDate =
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() -
              (
                5 -
                index
              ),
            1
          );

        const key = [
          monthDate.getFullYear(),

          String(
            monthDate.getMonth() +
              1
          ).padStart(
            2,
            "0"
          ),
        ].join("-");

        const label =
          new Intl.DateTimeFormat(
            "pt-BR",
            {
              month:
                "short",

              year:
                "2-digit",
            }
          )
            .format(
              monthDate
            )
            .replace(
              ".",
              ""
            );

        return {
          key,

          label,

          quantity:
            0,
        };
      }
    );

  tickets.forEach(
    (ticket) => {
      const createdAt =
        new Date(
          ticket.createdAt
        );

      if (
        !isValidDate(
          createdAt
        )
      ) {
        return;
      }

      const ticketMonthKey = [
        createdAt.getFullYear(),

        String(
          createdAt.getMonth() +
            1
        ).padStart(
          2,
          "0"
        ),
      ].join("-");

      const month =
        months.find(
          (item) =>
            item.key ===
            ticketMonthKey
        );

      if (month) {
        month.quantity +=
          1;
      }
    }
  );

  return months.map(
    (month) => ({
      month:
        month.label,

      quantity:
        month.quantity,
    })
  );
}

function createTechnicianRanking(
  tickets: Ticket[],
  users: User[]
): TechnicianRankingItem[] {
  const rankingMap =
    new Map<
      number | null,
      {
        technicianName:
          string;

        assignedTickets:
          number;

        resolvedTickets:
          number;
      }
    >();

  tickets.forEach(
    (ticket) => {
      const technicianId =
        ticket.assignedTechnicianId;

      const technicianName =
        getTechnicianName(
          technicianId,
          users
        );

      const currentData =
        rankingMap.get(
          technicianId
        ) ?? {
          technicianName,

          assignedTickets:
            0,

          resolvedTickets:
            0,
        };

      currentData.assignedTickets +=
        1;

      if (
        ticket.status ===
        "Resolvido"
      ) {
        currentData.resolvedTickets +=
          1;
      }

      rankingMap.set(
        technicianId,
        currentData
      );
    }
  );

  return Array.from(
    rankingMap.entries()
  )
    .map(
      ([
        technicianId,
        rankingData,
      ]) => ({
        technicianId,

        technicianName:
          rankingData.technicianName,

        assignedTickets:
          rankingData.assignedTickets,

        resolvedTickets:
          rankingData.resolvedTickets,

        resolutionRate:
          rankingData.assignedTickets ===
          0
            ? 0
            : Math.round(
                (
                  rankingData.resolvedTickets /
                  rankingData.assignedTickets
                ) * 100
              ),
      })
    )
    .sort(
      (
        firstItem,
        secondItem
      ) => {
        if (
          firstItem.resolvedTickets !==
          secondItem.resolvedTickets
        ) {
          return (
            secondItem.resolvedTickets -
            firstItem.resolvedTickets
          );
        }

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

function createStoreInventoryData(
  inventoryItems:
    InventoryItem[],
  stores:
    Store[]
): StoreInventoryChartItem[] {
  const equipmentTotals =
    new Map<
      number,
      number
    >();

  inventoryItems.forEach(
    (item) => {
      equipmentTotals.set(
        item.storeId,
        (
          equipmentTotals.get(
            item.storeId
          ) ?? 0
        ) + 1
      );
    }
  );

  return Array.from(
    equipmentTotals.entries()
  )
    .map(
      ([
        storeId,
        quantity,
      ]) => {
        const store =
          stores.find(
            (
              currentStore
            ) =>
              currentStore.id ===
              storeId
          );

        if (!store) {
          return {
            storeId,

            storeCode:
              String(
                storeId
              ),

            storeName:
              "Loja não encontrada",

            storeStatus:
              "Inativa" as StoreStatus,

            quantity,
          };
        }

        return {
          storeId:
            store.id,

          storeCode:
            store.code,

          storeName:
            store.name,

          storeStatus:
            store.status,

          quantity,
        };
      }
    )
    .sort(
      (
        firstStore,
        secondStore
      ) => {
        if (
          firstStore.quantity !==
          secondStore.quantity
        ) {
          return (
            secondStore.quantity -
            firstStore.quantity
          );
        }

        return firstStore.storeName.localeCompare(
          secondStore.storeName,
          "pt-BR"
        );
      }
    );
}

function getRecentTickets(
  tickets: Ticket[]
): Ticket[] {
  return [
    ...tickets,
  ]
    .sort(
      (
        firstTicket,
        secondTicket
      ) => {
        const firstCreatedAt =
          new Date(
            firstTicket.createdAt
          ).getTime();

        const secondCreatedAt =
          new Date(
            secondTicket.createdAt
          ).getTime();

        if (
          Number.isNaN(
            firstCreatedAt
          ) ||
          Number.isNaN(
            secondCreatedAt
          )
        ) {
          return (
            secondTicket.id -
            firstTicket.id
          );
        }

        return (
          secondCreatedAt -
          firstCreatedAt
        );
      }
    )
    .slice(
      0,
      5
    );
}

export function createDashboardData({
  tickets,
  users,
  inventoryItems,
  stores,
  period,
  storeFilter = "all",
}: CreateDashboardDataParams): DashboardData {
  const periodFilteredTickets =
    filterTicketsByPeriod(
      tickets,
      period
    );

  const filteredTickets =
    filterTicketsByStore(
      periodFilteredTickets,
      inventoryItems,
      storeFilter
    );

  const filteredInventoryItems =
    filterInventoryByStore(
      inventoryItems,
      storeFilter
    );

  return {
    filteredTickets,

    filteredInventoryItems,

    recentTickets:
      getRecentTickets(
        filteredTickets
      ),

    mainMetrics:
      calculateMainMetrics(
        filteredTickets
      ),

    executiveMetrics:
      calculateExecutiveMetrics(
        filteredTickets,
        users
      ),

    inventoryMetrics:
      calculateInventoryMetrics(
        filteredInventoryItems
      ),

    storeInventoryData:
      createStoreInventoryData(
        filteredInventoryItems,
        stores
      ),

    slaMetrics:
      calculateSlaMetrics(
        filteredTickets
      ),

    categoryChartData:
      createCategoryChartData(
        filteredTickets
      ),

    technicianChartData:
      createTechnicianChartData(
        filteredTickets,
        users
      ),

    monthlyChartData:
      createMonthlyChartData(
        filteredTickets
      ),

    technicianRanking:
      createTechnicianRanking(
        filteredTickets,
        users
      ),
  };
}