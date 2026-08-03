export type InventoryLabelSize =
  | "Pequena"
  | "Média"
  | "Completa";

export interface InventoryLabelOptions {
  size: InventoryLabelSize;

  showAssetNumber: boolean;

  showDescription: boolean;

  showStore: boolean;

  showQrCode: boolean;
}

export const DEFAULT_INVENTORY_LABEL_OPTIONS:
  InventoryLabelOptions = {
    size: "Completa",

    showAssetNumber: true,

    showDescription: true,

    showStore: true,

    showQrCode: true,
  };