import type { Ticket } from "../types/Ticket";

const STORAGE_KEY = "supportdesk-pro-tickets";

const initialTickets: Ticket[] = [
  {
    id: 1023,
    title: "Computador não liga",
    category: "Hardware",
    priority: "Alta",
    status: "Aberto",
  },
  {
    id: 1024,
    title: "Erro ao acessar o sistema",
    category: "Software",
    priority: "Média",
    status: "Em andamento",
  },
  {
    id: 1025,
    title: "Impressora sem conexão",
    category: "Rede",
    priority: "Baixa",
    status: "Resolvido",
  },
];

type CreateTicketData = Omit<Ticket, "id">;

function saveTicketsToStorage(tickets: Ticket[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch (error) {
    console.error(
      "Não foi possível salvar os chamados no Local Storage.",
      error
    );
  }
}

function loadTicketsFromStorage(): Ticket[] {
  try {
    const storedTickets = localStorage.getItem(STORAGE_KEY);

    if (!storedTickets) {
      saveTicketsToStorage(initialTickets);

      return [...initialTickets];
    }

    const parsedTickets = JSON.parse(storedTickets);

    if (!Array.isArray(parsedTickets)) {
      saveTicketsToStorage(initialTickets);

      return [...initialTickets];
    }

    return parsedTickets as Ticket[];
  } catch (error) {
    console.error(
      "Não foi possível carregar os chamados do Local Storage.",
      error
    );

    saveTicketsToStorage(initialTickets);

    return [...initialTickets];
  }
}

let tickets: Ticket[] = loadTicketsFromStorage();

export function findAllTickets(): Ticket[] {
  return [...tickets];
}

export function findTicketById(id: number): Ticket | undefined {
  return tickets.find((ticket) => ticket.id === id);
}

export function createTicketRepository(
  ticketData: CreateTicketData
): Ticket {
  const highestId = tickets.reduce(
    (currentHighestId, ticket) =>
      Math.max(currentHighestId, ticket.id),
    0
  );

  const newTicket: Ticket = {
    id: highestId + 1,
    ...ticketData,
  };

  tickets = [...tickets, newTicket];

  saveTicketsToStorage(tickets);

  return newTicket;
}

export function updateTicketById(
  id: number,
  updatedData: Partial<Ticket>
): Ticket | undefined {
  const ticketIndex = tickets.findIndex(
    (ticket) => ticket.id === id
  );

  if (ticketIndex === -1) {
    return undefined;
  }

  const updatedTicket: Ticket = {
    ...tickets[ticketIndex],
    ...updatedData,
    id,
  };

  tickets = tickets.map((ticket) =>
    ticket.id === id ? updatedTicket : ticket
  );

  saveTicketsToStorage(tickets);

  return updatedTicket;
}

export function deleteTicketById(id: number): boolean {
  const ticketExists = tickets.some(
    (ticket) => ticket.id === id
  );

  if (!ticketExists) {
    return false;
  }

  tickets = tickets.filter((ticket) => ticket.id !== id);

  saveTicketsToStorage(tickets);

  return true;
}