import type {
  InventoryItem,
} from "../types/InventoryItem";

const STORAGE_KEY =
  "supportdesk-pro-inventory";

const initialInventoryItems:
  InventoryItem[] = [];

function saveInventoryItems(
  items: InventoryItem[]
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      items
    )
  );
}

function normalizeStoredItem(
  item: InventoryItem
): InventoryItem {
  return {
    ...item,

    assetNumber:
      item.assetNumber ?? "",

    acquisitionDate:
      item.acquisitionDate ?? "",

    warrantyUntil:
      item.warrantyUntil ?? "",

    /*
     * Equipamentos cadastrados antes da criação
     * do campo recebem o estado físico "Bom".
     */
    condition:
      item.condition ?? "Bom",
  };
}

function loadInventoryItems():
  InventoryItem[] {
  const storedItems =
    localStorage.getItem(
      STORAGE_KEY
    );

  if (!storedItems) {
    saveInventoryItems(
      initialInventoryItems
    );

    return initialInventoryItems;
  }

  try {
    const parsedItems =
      JSON.parse(
        storedItems
      ) as unknown;

    if (
      !Array.isArray(
        parsedItems
      )
    ) {
      saveInventoryItems(
        initialInventoryItems
      );

      return initialInventoryItems;
    }

    const normalizedItems =
      (
        parsedItems as
          InventoryItem[]
      ).map(
        normalizeStoredItem
      );

    saveInventoryItems(
      normalizedItems
    );

    return normalizedItems;
  } catch (error) {
    console.error(
      "Não foi possível carregar o inventário.",
      error
    );

    saveInventoryItems(
      initialInventoryItems
    );

    return initialInventoryItems;
  }
}

function normalizeSearchValue(
  value: string
): string {
  return value
    .trim()
    .toLocaleLowerCase(
      "pt-BR"
    );
}

export function findAllInventoryItems():
  InventoryItem[] {
  return loadInventoryItems();
}

export function findInventoryItemById(
  itemId: number
): InventoryItem | undefined {
  return loadInventoryItems().find(
    (item) =>
      item.id === itemId
  );
}

export function findInventoryItemByTag(
  tag: string
): InventoryItem | undefined {
  const normalizedTag =
    normalizeSearchValue(
      tag
    );

  return loadInventoryItems().find(
    (item) =>
      normalizeSearchValue(
        item.tag
      ) === normalizedTag
  );
}

export function findInventoryItemByAssetNumber(
  assetNumber: string
): InventoryItem | undefined {
  const normalizedAssetNumber =
    normalizeSearchValue(
      assetNumber
    );

  if (!normalizedAssetNumber) {
    return undefined;
  }

  return loadInventoryItems().find(
    (item) =>
      normalizeSearchValue(
        item.assetNumber
      ) ===
      normalizedAssetNumber
  );
}

export function createInventoryItem(
  itemData: Omit<
    InventoryItem,
    | "id"
    | "createdAt"
    | "updatedAt"
  >
): InventoryItem {
  const items =
    loadInventoryItems();

  const highestId =
    items.reduce(
      (
        currentHighestId,
        item
      ) =>
        Math.max(
          currentHighestId,
          item.id
        ),
      0
    );

  const currentDate =
    new Date().toISOString();

  const newItem:
    InventoryItem = {
      ...itemData,

      id:
        highestId + 1,

      createdAt:
        currentDate,

      updatedAt:
        currentDate,
    };

  saveInventoryItems([
    ...items,
    newItem,
  ]);

  return newItem;
}

export function updateInventoryItemById(
  itemId: number,
  itemData: Partial<
    Omit<
      InventoryItem,
      | "id"
      | "createdAt"
      | "updatedAt"
    >
  >
): InventoryItem | undefined {
  const items =
    loadInventoryItems();

  let updatedItem:
    InventoryItem | undefined;

  const updatedItems =
    items.map(
      (item) => {
        if (
          item.id !==
          itemId
        ) {
          return item;
        }

        updatedItem = {
          ...item,
          ...itemData,

          updatedAt:
            new Date().toISOString(),
        };

        return updatedItem;
      }
    );

  saveInventoryItems(
    updatedItems
  );

  return updatedItem;
}

export function deleteInventoryItemById(
  itemId: number
): boolean {
  const items =
    loadInventoryItems();

  const updatedItems =
    items.filter(
      (item) =>
        item.id !== itemId
    );

  if (
    updatedItems.length ===
    items.length
  ) {
    return false;
  }

  saveInventoryItems(
    updatedItems
  );

  return true;
}

export function getNextAutomaticTag():
  string {
  const items =
    loadInventoryItems();

  const automaticNumbers =
    items
      .filter(
        (item) =>
          item.tagMode ===
          "Automática"
      )
      .map(
        (item) => {
          const match =
            /^TI-(\d+)$/i.exec(
              item.tag.trim()
            );

          if (!match) {
            return 0;
          }

          return Number(
            match[1]
          );
        }
      )
      .filter(
        (value) =>
          Number.isFinite(
            value
          ) &&
          value > 0
      );

  const highestNumber =
    automaticNumbers.length ===
    0
      ? 0
      : Math.max(
          ...automaticNumbers
        );

  return `TI-${String(
    highestNumber + 1
  ).padStart(
    6,
    "0"
  )}`;
}