export type InventoryTagMode =
  | "Automática"
  | "Manual";

export type InventoryStatus =
  | "Em uso"
  | "Em estoque"
  | "Em manutenção"
  | "Emprestado"
  | "Reserva"
  | "Descartado"
  | "Baixado";

export type InventoryCondition =
  | "Novo"
  | "Excelente"
  | "Bom"
  | "Regular"
  | "Ruim"
  | "Sucata";

export interface InventoryItem {
  id: number;

  tag: string;

  tagMode: InventoryTagMode;

  assetNumber: string;

  storeId: number;

  category: string;

  description: string;

  manufacturer: string;

  model: string;

  serialNumber: string;

  location: string;

  value: number;

  acquisitionDate: string;

  warrantyUntil: string;

  responsibleUserId: number | null;

  status: InventoryStatus;

  condition: InventoryCondition;

  notes: string;

  createdAt: string;

  updatedAt: string;
}