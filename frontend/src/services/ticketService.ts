import type { Ticket } from "../types/Ticket";

const tickets: Ticket[] = [
  {
    id: 1025,
    title: "Impressora não está funcionando",
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
    id: 1023,
    title: "Internet lenta no setor financeiro",
    category: "Rede",
    priority: "Baixa",
    status: "Resolvido",
  },
];

export function getTickets(): Ticket[] {
  return tickets;
}