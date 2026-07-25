import type { Ticket } from "../types/Ticket";

const tickets: Ticket[] = [
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

export function findAllTickets(): Ticket[] {
  return tickets;
}

export function findTicketById(id: number): Ticket | undefined {
  return tickets.find((ticket) => ticket.id === id);
}

export function updateTicketById(
  id: number,
  updatedData: Partial<Ticket>
): Ticket | undefined {
  const ticketIndex = tickets.findIndex((ticket) => ticket.id === id);

  if (ticketIndex === -1) {
    return undefined;
  }

  tickets[ticketIndex] = {
    ...tickets[ticketIndex],
    ...updatedData,
  };

  return tickets[ticketIndex];
}

export function deleteTicketById(id: number): boolean {
  const ticketIndex = tickets.findIndex((ticket) => ticket.id === id);

  if (ticketIndex === -1) {
    return false;
  }

  tickets.splice(ticketIndex, 1);

  return true;
}