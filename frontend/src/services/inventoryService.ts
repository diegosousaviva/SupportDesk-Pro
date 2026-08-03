import {
  createInventoryItem as createInventoryItemRepository,
  deleteInventoryItemById,
  findAllInventoryItems,
  findInventoryItemByAssetNumber,
  findInventoryItemById,
  findInventoryItemByTag,
  getNextAutomaticTag,
  updateInventoryItemById,
} from "../repositories/inventoryRepository";

import {
  getStoreById,
} from "./storeService";

import {
  getUserById,
} from "./userService";

import type {
  InventoryCondition,
  InventoryItem,
  InventoryTagMode,
} from "../types/InventoryItem";

export type CreateInventoryItemData = Omit<
  InventoryItem,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "tag"
> & {
  tag?: string;
};

export type UpdateInventoryItemData = Partial<
  CreateInventoryItemData
>;

const VALID_CONDITIONS:
  readonly InventoryCondition[] = [
    "Novo",
    "Excelente",
    "Bom",
    "Regular",
    "Ruim",
    "Sucata",
  ];

function normalizeText(
  value: string
): string {
  return value.trim();
}

function normalizeTag(
  tag: string
): string {
  return tag
    .trim()
    .toUpperCase();
}

function normalizeAssetNumber(
  assetNumber: string
): string {
  return assetNumber
    .trim()
    .toUpperCase();
}

function validateTagFormat(
  tag: string
): void {
  if (!tag) {
    throw new Error(
      "Informe a etiqueta do equipamento."
    );
  }

  if (tag.length > 50) {
    throw new Error(
      "A etiqueta deve possuir no máximo 50 caracteres."
    );
  }

  const validTagPattern =
    /^[A-Z0-9_-]+$/;

  if (
    !validTagPattern.test(
      tag
    )
  ) {
    throw new Error(
      "A etiqueta pode conter apenas letras, números, hífen e sublinhado."
    );
  }
}

function validateAssetNumberFormat(
  assetNumber: string
): void {
  if (!assetNumber) {
    return;
  }

  if (assetNumber.length > 50) {
    throw new Error(
      "O patrimônio deve possuir no máximo 50 caracteres."
    );
  }

  const validAssetNumberPattern =
    /^[A-Z0-9_-]+$/;

  if (
    !validAssetNumberPattern.test(
      assetNumber
    )
  ) {
    throw new Error(
      "O patrimônio pode conter apenas letras, números, hífen e sublinhado."
    );
  }
}

function ensureUniqueTag(
  tag: string,
  ignoredItemId?: number
): void {
  const existingItem =
    findInventoryItemByTag(
      tag
    );

  if (
    existingItem &&
    existingItem.id !==
      ignoredItemId
  ) {
    throw new Error(
      "Já existe um equipamento cadastrado com essa etiqueta."
    );
  }
}

function ensureUniqueAssetNumber(
  assetNumber: string,
  ignoredItemId?: number
): void {
  if (!assetNumber) {
    return;
  }

  const existingItem =
    findInventoryItemByAssetNumber(
      assetNumber
    );

  if (
    existingItem &&
    existingItem.id !==
      ignoredItemId
  ) {
    throw new Error(
      "Já existe um equipamento cadastrado com esse patrimônio."
    );
  }
}

function validateStore(
  storeId: number
): void {
  const store =
    getStoreById(
      storeId
    );

  if (!store) {
    throw new Error(
      "Selecione uma loja válida."
    );
  }

  if (
    store.status !==
    "Ativa"
  ) {
    throw new Error(
      "A loja selecionada está inativa."
    );
  }
}

function validateResponsibleUser(
  responsibleUserId:
    number | null
): void {
  if (
    responsibleUserId ===
    null
  ) {
    return;
  }

  const user =
    getUserById(
      responsibleUserId
    );

  if (!user) {
    throw new Error(
      "Selecione um responsável válido."
    );
  }

  if (
    user.status !==
    "Ativo"
  ) {
    throw new Error(
      "O usuário responsável está inativo."
    );
  }
}

function validateRequiredFields(
  description: string,
  category: string,
  location: string
): void {
  if (!description) {
    throw new Error(
      "Informe a descrição do equipamento."
    );
  }

  if (!category) {
    throw new Error(
      "Informe a categoria do equipamento."
    );
  }

  if (!location) {
    throw new Error(
      "Informe a localização do equipamento."
    );
  }
}

function validateValue(
  value: number
): void {
  if (
    !Number.isFinite(
      value
    ) ||
    value < 0
  ) {
    throw new Error(
      "Informe um valor válido para o equipamento."
    );
  }
}

function validateCondition(
  condition: InventoryCondition
): void {
  if (
    !VALID_CONDITIONS.includes(
      condition
    )
  ) {
    throw new Error(
      "Selecione um estado físico válido."
    );
  }
}

function isValidDateString(
  value: string
): boolean {
  if (!value) {
    return true;
  }

  const datePattern =
    /^\d{4}-\d{2}-\d{2}$/;

  if (
    !datePattern.test(
      value
    )
  ) {
    return false;
  }

  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  const date =
    new Date(
      year,
      month - 1,
      day
    );

  return (
    date.getFullYear() ===
      year &&
    date.getMonth() ===
      month - 1 &&
    date.getDate() ===
      day
  );
}

function validateDates(
  acquisitionDate: string,
  warrantyUntil: string
): void {
  if (
    !isValidDateString(
      acquisitionDate
    )
  ) {
    throw new Error(
      "Informe uma data de aquisição válida."
    );
  }

  if (
    !isValidDateString(
      warrantyUntil
    )
  ) {
    throw new Error(
      "Informe uma data de garantia válida."
    );
  }

  if (
    acquisitionDate &&
    warrantyUntil
  ) {
    const acquisition =
      new Date(
        `${acquisitionDate}T00:00:00`
      );

    const warranty =
      new Date(
        `${warrantyUntil}T00:00:00`
      );

    if (
      warranty.getTime() <
      acquisition.getTime()
    ) {
      throw new Error(
        "A data final da garantia não pode ser anterior à data de aquisição."
      );
    }
  }
}

function resolveTag(
  tagMode: InventoryTagMode,
  informedTag?: string
): string {
  if (
    tagMode ===
    "Automática"
  ) {
    return getNextAutomaticTag();
  }

  const normalizedTag =
    normalizeTag(
      informedTag ?? ""
    );

  validateTagFormat(
    normalizedTag
  );

  return normalizedTag;
}

export function getInventoryItems():
  InventoryItem[] {
  return findAllInventoryItems()
    .sort(
      (
        firstItem,
        secondItem
      ) =>
        firstItem.tag.localeCompare(
          secondItem.tag,
          "pt-BR"
        )
    );
}

export function getInventoryItemById(
  itemId: number
): InventoryItem | undefined {
  if (
    !Number.isInteger(
      itemId
    ) ||
    itemId <= 0
  ) {
    return undefined;
  }

  return findInventoryItemById(
    itemId
  );
}

export function getInventoryItemByTag(
  tag: string
): InventoryItem | undefined {
  const normalizedTag =
    normalizeTag(
      tag
    );

  if (!normalizedTag) {
    return undefined;
  }

  return findInventoryItemByTag(
    normalizedTag
  );
}

export function getInventoryItemByAssetNumber(
  assetNumber: string
): InventoryItem | undefined {
  const normalizedAssetNumber =
    normalizeAssetNumber(
      assetNumber
    );

  if (!normalizedAssetNumber) {
    return undefined;
  }

  return findInventoryItemByAssetNumber(
    normalizedAssetNumber
  );
}

export function createInventoryItem(
  itemData: CreateInventoryItemData
): InventoryItem {
  const description =
    normalizeText(
      itemData.description
    );

  const category =
    normalizeText(
      itemData.category
    );

  const location =
    normalizeText(
      itemData.location
    );

  const assetNumber =
    normalizeAssetNumber(
      itemData.assetNumber
    );

  const acquisitionDate =
    normalizeText(
      itemData.acquisitionDate
    );

  const warrantyUntil =
    normalizeText(
      itemData.warrantyUntil
    );

  const tag =
    resolveTag(
      itemData.tagMode,
      itemData.tag
    );

  validateTagFormat(
    tag
  );

  validateAssetNumberFormat(
    assetNumber
  );

  ensureUniqueTag(
    tag
  );

  ensureUniqueAssetNumber(
    assetNumber
  );

  validateStore(
    itemData.storeId
  );

  validateResponsibleUser(
    itemData.responsibleUserId
  );

  validateRequiredFields(
    description,
    category,
    location
  );

  validateValue(
    itemData.value
  );

  validateDates(
    acquisitionDate,
    warrantyUntil
  );

  validateCondition(
    itemData.condition
  );

  return createInventoryItemRepository(
    {
      tag,

      tagMode:
        itemData.tagMode,

      assetNumber,

      storeId:
        itemData.storeId,

      category,

      description,

      manufacturer:
        normalizeText(
          itemData.manufacturer
        ),

      model:
        normalizeText(
          itemData.model
        ),

      serialNumber:
        normalizeText(
          itemData.serialNumber
        ),

      location,

      value:
        itemData.value,

      acquisitionDate,

      warrantyUntil,

      responsibleUserId:
        itemData.responsibleUserId,

      status:
        itemData.status,

      condition:
        itemData.condition,

      notes:
        normalizeText(
          itemData.notes
        ),
    }
  );
}

export function updateInventoryItem(
  itemId: number,
  itemData: UpdateInventoryItemData
): InventoryItem | undefined {
  const currentItem =
    getInventoryItemById(
      itemId
    );

  if (!currentItem) {
    return undefined;
  }

  const tagMode =
    itemData.tagMode ??
    currentItem.tagMode;

  let tag =
    currentItem.tag;

  if (
    tagMode ===
    "Manual"
  ) {
    tag =
      normalizeTag(
        itemData.tag ??
          currentItem.tag
      );
  } else if (
    currentItem.tagMode !==
    "Automática"
  ) {
    tag =
      getNextAutomaticTag();
  }

  const assetNumber =
    itemData.assetNumber ===
    undefined
      ? currentItem.assetNumber
      : normalizeAssetNumber(
          itemData.assetNumber
        );

  const acquisitionDate =
    itemData.acquisitionDate ===
    undefined
      ? currentItem.acquisitionDate
      : normalizeText(
          itemData.acquisitionDate
        );

  const warrantyUntil =
    itemData.warrantyUntil ===
    undefined
      ? currentItem.warrantyUntil
      : normalizeText(
          itemData.warrantyUntil
        );

  const storeId =
    itemData.storeId ??
    currentItem.storeId;

  const responsibleUserId =
    itemData.responsibleUserId ===
    undefined
      ? currentItem.responsibleUserId
      : itemData.responsibleUserId;

  const description =
    itemData.description ===
    undefined
      ? currentItem.description
      : normalizeText(
          itemData.description
        );

  const category =
    itemData.category ===
    undefined
      ? currentItem.category
      : normalizeText(
          itemData.category
        );

  const location =
    itemData.location ===
    undefined
      ? currentItem.location
      : normalizeText(
          itemData.location
        );

  const value =
    itemData.value ??
    currentItem.value;

  const condition =
    itemData.condition ??
    currentItem.condition;

  validateTagFormat(
    tag
  );

  validateAssetNumberFormat(
    assetNumber
  );

  ensureUniqueTag(
    tag,
    itemId
  );

  ensureUniqueAssetNumber(
    assetNumber,
    itemId
  );

  validateStore(
    storeId
  );

  validateResponsibleUser(
    responsibleUserId
  );

  validateRequiredFields(
    description,
    category,
    location
  );

  validateValue(
    value
  );

  validateDates(
    acquisitionDate,
    warrantyUntil
  );

  validateCondition(
    condition
  );

  return updateInventoryItemById(
    itemId,
    {
      tag,

      tagMode,

      assetNumber,

      storeId,

      category,

      description,

      manufacturer:
        itemData.manufacturer ===
        undefined
          ? currentItem.manufacturer
          : normalizeText(
              itemData.manufacturer
            ),

      model:
        itemData.model ===
        undefined
          ? currentItem.model
          : normalizeText(
              itemData.model
            ),

      serialNumber:
        itemData.serialNumber ===
        undefined
          ? currentItem.serialNumber
          : normalizeText(
              itemData.serialNumber
            ),

      location,

      value,

      acquisitionDate,

      warrantyUntil,

      responsibleUserId,

      status:
        itemData.status ??
        currentItem.status,

      condition,

      notes:
        itemData.notes ===
        undefined
          ? currentItem.notes
          : normalizeText(
              itemData.notes
            ),
    }
  );
}

export function deleteInventoryItem(
  itemId: number
): boolean {
  return deleteInventoryItemById(
    itemId
  );
}

export function previewNextAutomaticTag():
  string {
  return getNextAutomaticTag();
}