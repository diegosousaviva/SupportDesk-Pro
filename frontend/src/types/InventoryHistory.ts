export type InventoryHistoryEventType =
  | "Cadastro"
  | "Edição"
  | "Mudança de situação"
  | "Mudança de responsável"
  | "Mudança de loja"
  | "Mudança de estado físico"
  | "Impressão de etiqueta"
  | "Chamado vinculado"
  | "Manutenção"
  | "Observação";

export interface InventoryHistoryEvent {
  id: number;

  inventoryItemId: number;

  type: InventoryHistoryEventType;

  title: string;

  description: string;

  performedByUserId: number | null;

  createdAt: string;
}

export interface CreateInventoryHistoryEventData {
  inventoryItemId: number;

  type: InventoryHistoryEventType;

  title: string;

  description: string;

  performedByUserId: number | null;
}