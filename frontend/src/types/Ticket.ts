export interface Ticket {
  id: number;
  title: string;
  category: string;
  priority: "Baixa" | "Média" | "Alta" | "Crítica";
  status: "Aberto" | "Em andamento" | "Resolvido";
}