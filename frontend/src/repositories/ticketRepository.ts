import type {
  Ticket,
  TicketPriority,
  TicketStatus,
} from "../types/Ticket";

const STORAGE_KEY =
  "supportdesk-pro-tickets";

type CreateTicketData = Omit<
  Ticket,
  "id" | "createdAt" | "updatedAt"
>;

type StoredTicket = Partial<Ticket> & {
  id?: unknown;
  title?: unknown;
  description?: unknown;
  category?: unknown;
  priority?: unknown;
  status?: unknown;
  requesterUserId?: unknown;
  assignedTechnicianId?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  closedAt?: unknown;
};

const initialTickets: Ticket[] = [
  {
    id: 1023,
    title: "Computador não liga",
    description:
      "O computador não apresenta sinais de energia ao pressionar o botão de ligar.",
    category: "Hardware",
    priority: "Alta",
    status: "Aberto",
    requesterUserId: 3,
    assignedTechnicianId: null,
    createdAt:
      "2026-05-10T09:00:00.000Z",
    updatedAt:
      "2026-05-10T09:00:00.000Z",
    closedAt: null,
  },
  {
    id: 1024,
    title: "Erro ao acessar o sistema",
    description:
      "O usuário recebe uma mensagem de erro ao tentar acessar o sistema.",
    category: "Software",
    priority: "Média",
    status: "Em andamento",
    requesterUserId: 3,
    assignedTechnicianId: 2,
    createdAt:
      "2026-06-11T10:30:00.000Z",
    updatedAt:
      "2026-06-11T11:15:00.000Z",
    closedAt: null,
  },
  {
    id: 1025,
    title: "Impressora sem conexão",
    description:
      "A impressora não está sendo localizada pelos computadores da rede.",
    category: "Rede",
    priority: "Baixa",
    status: "Resolvido",
    requesterUserId: 3,
    assignedTechnicianId: 2,
    createdAt:
      "2026-07-12T08:45:00.000Z",
    updatedAt:
      "2026-07-12T14:20:00.000Z",
    closedAt:
      "2026-07-12T14:20:00.000Z",
  },
];

function isTicketPriority(
  value: unknown
): value is TicketPriority {
  return (
    value === "Baixa" ||
    value === "Média" ||
    value === "Alta" ||
    value === "Crítica"
  );
}

function isTicketStatus(
  value: unknown
): value is TicketStatus {
  return (
    value === "Aberto" ||
    value === "Em andamento" ||
    value === "Resolvido"
  );
}

function isValidDateString(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    !Number.isNaN(
      Date.parse(value)
    )
  );
}

function normalizeUserId(
  value: unknown,
  defaultValue: number
): number {
  if (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0
  ) {
    return value;
  }

  return defaultValue;
}

function normalizeTechnicianId(
  value: unknown
): number | null {
  if (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0
  ) {
    return value;
  }

  return null;
}

function normalizeClosedAt(
  value: unknown,
  status: TicketStatus,
  updatedAt: string
): string | null {
  if (
    status !== "Resolvido"
  ) {
    return null;
  }

  if (
    isValidDateString(value)
  ) {
    return value;
  }

  return updatedAt;
}

function migrateStoredTicket(
  storedTicket: StoredTicket
): Ticket | null {
  if (
    typeof storedTicket.id !==
      "number" ||
    !Number.isInteger(
      storedTicket.id
    ) ||
    typeof storedTicket.title !==
      "string" ||
    typeof storedTicket.category !==
      "string" ||
    !isTicketPriority(
      storedTicket.priority
    ) ||
    !isTicketStatus(
      storedTicket.status
    )
  ) {
    return null;
  }

  const migrationDate =
    new Date().toISOString();

  const createdAt =
    isValidDateString(
      storedTicket.createdAt
    )
      ? storedTicket.createdAt
      : migrationDate;

  const updatedAt =
    isValidDateString(
      storedTicket.updatedAt
    )
      ? storedTicket.updatedAt
      : createdAt;

  const requesterUserId =
    normalizeUserId(
      storedTicket.requesterUserId,
      3
    );

  const closedAt =
    normalizeClosedAt(
      storedTicket.closedAt,
      storedTicket.status,
      updatedAt
    );

  return {
    id: storedTicket.id,
    title:
      storedTicket.title.trim(),
    description:
      typeof storedTicket.description ===
      "string"
        ? storedTicket.description
        : "",
    category:
      storedTicket.category.trim(),
    priority:
      storedTicket.priority,
    status:
      storedTicket.status,
    requesterUserId,
    assignedTechnicianId:
      normalizeTechnicianId(
        storedTicket.assignedTechnicianId
      ),
    createdAt,
    updatedAt,
    closedAt,
  };
}

function saveTicketsToStorage(
  ticketsToSave: Ticket[]
): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        ticketsToSave
      )
    );
  } catch (error) {
    console.error(
      "Não foi possível salvar os chamados no Local Storage.",
      error
    );
  }
}

function loadTicketsFromStorage(): Ticket[] {
  try {
    const storedTickets =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!storedTickets) {
      saveTicketsToStorage(
        initialTickets
      );

      return [
        ...initialTickets,
      ];
    }

    const parsedData: unknown =
      JSON.parse(storedTickets);

    if (
      !Array.isArray(
        parsedData
      )
    ) {
      saveTicketsToStorage(
        initialTickets
      );

      return [
        ...initialTickets,
      ];
    }

    const migratedTickets =
      parsedData
        .map(
          (storedTicket) =>
            migrateStoredTicket(
              storedTicket as StoredTicket
            )
        )
        .filter(
          (
            ticket
          ): ticket is Ticket =>
            ticket !== null
        );

    if (
      migratedTickets.length ===
      0
    ) {
      saveTicketsToStorage(
        initialTickets
      );

      return [
        ...initialTickets,
      ];
    }

    saveTicketsToStorage(
      migratedTickets
    );

    return migratedTickets;
  } catch (error) {
    console.error(
      "Não foi possível carregar os chamados do Local Storage.",
      error
    );

    saveTicketsToStorage(
      initialTickets
    );

    return [
      ...initialTickets,
    ];
  }
}

let tickets: Ticket[] =
  loadTicketsFromStorage();

export function findAllTickets(): Ticket[] {
  return [
    ...tickets,
  ];
}

export function findTicketById(
  id: number
): Ticket | undefined {
  return tickets.find(
    (ticket) =>
      ticket.id === id
  );
}

export function createTicketRepository(
  ticketData: CreateTicketData
): Ticket {
  const highestId =
    tickets.reduce(
      (
        currentHighestId,
        ticket
      ) =>
        Math.max(
          currentHighestId,
          ticket.id
        ),
      0
    );

  const currentDate =
    new Date().toISOString();

  const newTicket: Ticket = {
    ...ticketData,
    id: highestId + 1,
    createdAt: currentDate,
    updatedAt: currentDate,
    closedAt:
      ticketData.status ===
      "Resolvido"
        ? ticketData.closedAt ??
          currentDate
        : null,
  };

  tickets = [
    ...tickets,
    newTicket,
  ];

  saveTicketsToStorage(
    tickets
  );

  return newTicket;
}

export function updateTicketById(
  id: number,
  updatedData: Partial<
    Omit<
      Ticket,
      "id" |
        "createdAt" |
        "updatedAt"
    >
  >
): Ticket | undefined {
  const currentTicket =
    tickets.find(
      (ticket) =>
        ticket.id === id
    );

  if (!currentTicket) {
    return undefined;
  }

  const currentDate =
    new Date().toISOString();

  const newStatus =
    updatedData.status ??
    currentTicket.status;

  let closedAt =
    updatedData.closedAt ??
    currentTicket.closedAt;

  if (
    newStatus === "Resolvido" &&
    currentTicket.status !==
      "Resolvido" &&
    updatedData.closedAt ===
      undefined
  ) {
    closedAt =
      currentDate;
  }

  if (
    newStatus !==
    "Resolvido"
  ) {
    closedAt = null;
  }

  const updatedTicket: Ticket = {
    ...currentTicket,
    ...updatedData,
    id: currentTicket.id,
    createdAt:
      currentTicket.createdAt,
    updatedAt:
      currentDate,
    closedAt,
  };

  tickets = tickets.map(
    (ticket) =>
      ticket.id === id
        ? updatedTicket
        : ticket
  );

  saveTicketsToStorage(
    tickets
  );

  return updatedTicket;
}

export function deleteTicketById(
  id: number
): boolean {
  const ticketExists =
    tickets.some(
      (ticket) =>
        ticket.id === id
    );

  if (!ticketExists) {
    return false;
  }

  tickets =
    tickets.filter(
      (ticket) =>
        ticket.id !== id
    );

  saveTicketsToStorage(
    tickets
  );

  return true;
}