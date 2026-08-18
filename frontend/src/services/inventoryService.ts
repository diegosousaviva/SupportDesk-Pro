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
  createAuditLog,
} from "./auditLogService";

import {
  getCurrentUser,
} from "./authService";

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

const MAXIMUM_TAG_LENGTH =
  50;

const MAXIMUM_ASSET_NUMBER_LENGTH =
  50;

const MAXIMUM_LOCATION_LENGTH =
  120;

const MAXIMUM_CATEGORY_LENGTH =
  80;

const MINIMUM_DESCRIPTION_LENGTH =
  3;

const MAXIMUM_DESCRIPTION_LENGTH =
  200;

const MAXIMUM_MANUFACTURER_LENGTH =
  100;

const MAXIMUM_MODEL_LENGTH =
  100;

const MAXIMUM_SERIAL_NUMBER_LENGTH =
  100;

const MAXIMUM_NOTES_LENGTH =
  2000;

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

function validateMaximumLength(
  value: string,
  maximumLength: number,
  fieldName: string
): void {
  if (
    value.length >
    maximumLength
  ) {
    throw new Error(
      `${fieldName} deve possuir no máximo ${maximumLength.toLocaleString(
        "pt-BR"
      )} caracteres.`
    );
  }
}

function getAuditUser(): {
  userId: number | null;
  userName: string;
} {
  const currentUser =
    getCurrentUser();

  if (!currentUser) {
    return {
      userId: null,
      userName: "Sistema",
    };
  }

  return {
    userId:
      currentUser.id,

    userName:
      currentUser.name,
  };
}

function registerInventoryAudit(
  itemId: number,
  action:
    | "Criação"
    | "Edição"
    | "Exclusão"
    | "Alteração de status"
    | "Alteração de responsável",
  description: string,
  details?: string
): void {
  const auditUser =
    getAuditUser();

  createAuditLog({
    module:
      "Inventário",

    action,

    userId:
      auditUser.userId,

    userName:
      auditUser.userName,

    entityId:
      itemId,

    description,

    details,
  });
}

function getStoreDescription(
  storeId: number
): string {
  const store =
    getStoreById(
      storeId
    );

  if (!store) {
    return `Loja não encontrada (#${storeId})`;
  }

  return store.name;
}

function getResponsibleDescription(
  responsibleUserId:
    number | null
): string {
  if (
    responsibleUserId ===
    null
  ) {
    return "Não atribuído";
  }

  const user =
    getUserById(
      responsibleUserId
    );

  if (!user) {
    return `Usuário não encontrado (#${responsibleUserId})`;
  }

  return user.name;
}

function validateTagFormat(
  tag: string
): void {
  if (!tag) {
    throw new Error(
      "Informe a etiqueta do equipamento."
    );
  }

  validateMaximumLength(
    tag,
    MAXIMUM_TAG_LENGTH,
    "A etiqueta"
  );

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

  validateMaximumLength(
    assetNumber,
    MAXIMUM_ASSET_NUMBER_LENGTH,
    "O patrimônio"
  );

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
  if (
    !Number.isInteger(
      storeId
    ) ||
    storeId <= 0
  ) {
    throw new Error(
      "Selecione uma loja válida."
    );
  }

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

  if (
    !Number.isInteger(
      responsibleUserId
    ) ||
    responsibleUserId <= 0
  ) {
    throw new Error(
      "Selecione um responsável válido."
    );
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

  if (
    description.length <
    MINIMUM_DESCRIPTION_LENGTH
  ) {
    throw new Error(
      `A descrição deve possuir pelo menos ${MINIMUM_DESCRIPTION_LENGTH} caracteres.`
    );
  }

  validateMaximumLength(
    description,
    MAXIMUM_DESCRIPTION_LENGTH,
    "A descrição"
  );

  if (!category) {
    throw new Error(
      "Informe a categoria do equipamento."
    );
  }

  validateMaximumLength(
    category,
    MAXIMUM_CATEGORY_LENGTH,
    "A categoria"
  );

  if (!location) {
    throw new Error(
      "Informe a localização do equipamento."
    );
  }

  validateMaximumLength(
    location,
    MAXIMUM_LOCATION_LENGTH,
    "A localização"
  );
}

function validateOptionalTextFields(
  manufacturer: string,
  model: string,
  serialNumber: string,
  notes: string
): void {
  validateMaximumLength(
    manufacturer,
    MAXIMUM_MANUFACTURER_LENGTH,
    "O fabricante"
  );

  validateMaximumLength(
    model,
    MAXIMUM_MODEL_LENGTH,
    "O modelo"
  );

  validateMaximumLength(
    serialNumber,
    MAXIMUM_SERIAL_NUMBER_LENGTH,
    "O número de série"
  );

  validateMaximumLength(
    notes,
    MAXIMUM_NOTES_LENGTH,
    "As observações"
  );
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
      informedTag ??
        ""
    );

  validateTagFormat(
    normalizedTag
  );

  return normalizedTag;
}

function registerInventoryChanges(
  currentItem: InventoryItem,
  updatedItem: InventoryItem
): void {
  const generalChanges:
    string[] = [];

  if (
    currentItem.tag !==
    updatedItem.tag
  ) {
    generalChanges.push(
      `Etiqueta: "${currentItem.tag}" → "${updatedItem.tag}"`
    );
  }

  if (
    currentItem.assetNumber !==
    updatedItem.assetNumber
  ) {
    generalChanges.push(
      `Patrimônio: "${currentItem.assetNumber || "Não informado"}" → "${updatedItem.assetNumber || "Não informado"}"`
    );
  }

  if (
    currentItem.description !==
    updatedItem.description
  ) {
    generalChanges.push(
      "Descrição alterada"
    );
  }

  if (
    currentItem.category !==
    updatedItem.category
  ) {
    generalChanges.push(
      `Categoria: "${currentItem.category}" → "${updatedItem.category}"`
    );
  }

  if (
    currentItem.manufacturer !==
    updatedItem.manufacturer
  ) {
    generalChanges.push(
      `Fabricante: "${currentItem.manufacturer || "Não informado"}" → "${updatedItem.manufacturer || "Não informado"}"`
    );
  }

  if (
    currentItem.model !==
    updatedItem.model
  ) {
    generalChanges.push(
      `Modelo: "${currentItem.model || "Não informado"}" → "${updatedItem.model || "Não informado"}"`
    );
  }

  if (
    currentItem.serialNumber !==
    updatedItem.serialNumber
  ) {
    generalChanges.push(
      "Número de série alterado"
    );
  }

  if (
    currentItem.location !==
    updatedItem.location
  ) {
    generalChanges.push(
      `Localização: "${currentItem.location}" → "${updatedItem.location}"`
    );
  }

  if (
    currentItem.value !==
    updatedItem.value
  ) {
    generalChanges.push(
      `Valor: ${currentItem.value} → ${updatedItem.value}`
    );
  }

  if (
    currentItem.acquisitionDate !==
    updatedItem.acquisitionDate
  ) {
    generalChanges.push(
      "Data de aquisição alterada"
    );
  }

  if (
    currentItem.warrantyUntil !==
    updatedItem.warrantyUntil
  ) {
    generalChanges.push(
      "Data de garantia alterada"
    );
  }

  if (
    currentItem.notes !==
    updatedItem.notes
  ) {
    generalChanges.push(
      "Observações alteradas"
    );
  }

  if (
    generalChanges.length >
    0
  ) {
    registerInventoryAudit(
      updatedItem.id,
      "Edição",
      `Equipamento ${updatedItem.tag} editado.`,
      generalChanges.join(
        " | "
      )
    );
  }

  if (
    currentItem.status !==
    updatedItem.status
  ) {
    registerInventoryAudit(
      updatedItem.id,
      "Alteração de status",
      `Situação do equipamento ${updatedItem.tag} alterada.`,
      `"${currentItem.status}" → "${updatedItem.status}"`
    );
  }

  if (
    currentItem.responsibleUserId !==
    updatedItem.responsibleUserId
  ) {
    const previousResponsible =
      getResponsibleDescription(
        currentItem.responsibleUserId
      );

    const newResponsible =
      getResponsibleDescription(
        updatedItem.responsibleUserId
      );

    registerInventoryAudit(
      updatedItem.id,
      "Alteração de responsável",
      `Responsável pelo equipamento ${updatedItem.tag} alterado.`,
      `"${previousResponsible}" → "${newResponsible}"`
    );
  }

  if (
    currentItem.storeId !==
    updatedItem.storeId
  ) {
    const previousStore =
      getStoreDescription(
        currentItem.storeId
      );

    const newStore =
      getStoreDescription(
        updatedItem.storeId
      );

    registerInventoryAudit(
      updatedItem.id,
      "Edição",
      `Loja do equipamento ${updatedItem.tag} alterada.`,
      `"${previousStore}" → "${newStore}"`
    );
  }

  if (
    currentItem.condition !==
    updatedItem.condition
  ) {
    registerInventoryAudit(
      updatedItem.id,
      "Edição",
      `Estado físico do equipamento ${updatedItem.tag} alterado.`,
      `"${currentItem.condition}" → "${updatedItem.condition}"`
    );
  }
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

  const manufacturer =
    normalizeText(
      itemData.manufacturer
    );

  const model =
    normalizeText(
      itemData.model
    );

  const serialNumber =
    normalizeText(
      itemData.serialNumber
    );

  const notes =
    normalizeText(
      itemData.notes
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

  validateOptionalTextFields(
    manufacturer,
    model,
    serialNumber,
    notes
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

  const createdItem =
    createInventoryItemRepository({
      tag,

      tagMode:
        itemData.tagMode,

      assetNumber,

      storeId:
        itemData.storeId,

      category,

      description,

      manufacturer,

      model,

      serialNumber,

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

      notes,
    });

  registerInventoryAudit(
    createdItem.id,
    "Criação",
    `Equipamento ${createdItem.tag} cadastrado.`,
    `Categoria: ${createdItem.category} | Situação: ${createdItem.status} | Estado físico: ${createdItem.condition}`
  );

  return createdItem;
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

  const manufacturer =
    itemData.manufacturer ===
    undefined
      ? currentItem.manufacturer
      : normalizeText(
          itemData.manufacturer
        );

  const model =
    itemData.model ===
    undefined
      ? currentItem.model
      : normalizeText(
          itemData.model
        );

  const serialNumber =
    itemData.serialNumber ===
    undefined
      ? currentItem.serialNumber
      : normalizeText(
          itemData.serialNumber
        );

  const notes =
    itemData.notes ===
    undefined
      ? currentItem.notes
      : normalizeText(
          itemData.notes
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

  validateOptionalTextFields(
    manufacturer,
    model,
    serialNumber,
    notes
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

  const updatedItem =
    updateInventoryItemById(
      itemId,
      {
        tag,

        tagMode,

        assetNumber,

        storeId,

        category,

        description,

        manufacturer,

        model,

        serialNumber,

        location,

        value,

        acquisitionDate,

        warrantyUntil,

        responsibleUserId,

        status:
          itemData.status ??
          currentItem.status,

        condition,

        notes,
      }
    );

  if (!updatedItem) {
    return undefined;
  }

  registerInventoryChanges(
    currentItem,
    updatedItem
  );

  return updatedItem;
}

export function deleteInventoryItem(
  itemId: number
): boolean {
  const currentItem =
    getInventoryItemById(
      itemId
    );

  if (!currentItem) {
    return false;
  }

  const deleted =
    deleteInventoryItemById(
      itemId
    );

  if (deleted) {
    registerInventoryAudit(
      currentItem.id,
      "Exclusão",
      `Equipamento ${currentItem.tag} excluído.`,
      `Descrição: "${currentItem.description}" | Categoria: ${currentItem.category} | Situação: ${currentItem.status}`
    );
  }

  return deleted;
}

export function previewNextAutomaticTag():
  string {
  return getNextAutomaticTag();
}