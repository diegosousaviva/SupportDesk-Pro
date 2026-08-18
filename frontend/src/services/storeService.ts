import {
  createStore as createStoreRepository,
  deleteStoreById,
  findAllStores,
  findStoreByCode,
  findStoreById,
  updateStoreById,
} from "../repositories/storeRepository";

import type {
  Store,
  StoreStatus,
} from "../types/Store";

import {
  createAuditLog,
} from "./auditLogService";

import {
  getCurrentUser,
} from "./authService";

export type CreateStoreData = Omit<
  Store,
  | "id"
  | "createdAt"
  | "updatedAt"
>;

export type UpdateStoreData = Partial<
  CreateStoreData
>;

const MAXIMUM_CODE_LENGTH =
  20;

const MINIMUM_NAME_LENGTH =
  3;

const MAXIMUM_NAME_LENGTH =
  100;

const MAXIMUM_ADDRESS_LENGTH =
  200;

const MAXIMUM_CITY_LENGTH =
  100;

const MAXIMUM_PHONE_LENGTH =
  30;

const MAXIMUM_EMAIL_LENGTH =
  150;

const MAXIMUM_MANAGER_LENGTH =
  100;

const MAXIMUM_NOTES_LENGTH =
  2000;

const CODE_PATTERN =
  /^[A-Z0-9_-]+$/;

const STATE_PATTERN =
  /^[A-Z]{2}$/;

const ZIP_CODE_PATTERN =
  /^\d{5}-?\d{3}$/;

const PHONE_PATTERN =
  /^[0-9()+\-\s.]+$/;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALID_STATUSES:
  readonly StoreStatus[] = [
    "Ativa",
    "Inativa",
  ];

function normalizeCode(
  code: string
): string {
  return code
    .trim()
    .toUpperCase();
}

function normalizeText(
  value: string
): string {
  return value.trim();
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
      `${fieldName} deve possuir no máximo ${maximumLength} caracteres.`
    );
  }
}

function validateStoreCode(
  code: string
): void {
  if (!code) {
    throw new Error(
      "Informe o código da loja."
    );
  }

  validateMaximumLength(
    code,
    MAXIMUM_CODE_LENGTH,
    "O código da loja"
  );

  if (
    !CODE_PATTERN.test(
      code
    )
  ) {
    throw new Error(
      "O código da loja pode conter apenas letras, números, hífen e sublinhado."
    );
  }
}

function validateStoreName(
  name: string
): void {
  if (!name) {
    throw new Error(
      "Informe o nome da loja."
    );
  }

  if (
    name.length <
    MINIMUM_NAME_LENGTH
  ) {
    throw new Error(
      `O nome da loja deve possuir pelo menos ${MINIMUM_NAME_LENGTH} caracteres.`
    );
  }

  validateMaximumLength(
    name,
    MAXIMUM_NAME_LENGTH,
    "O nome da loja"
  );
}

function validateAddress(
  address: string
): void {
  validateMaximumLength(
    address,
    MAXIMUM_ADDRESS_LENGTH,
    "O endereço"
  );
}

function validateCity(
  city: string
): void {
  validateMaximumLength(
    city,
    MAXIMUM_CITY_LENGTH,
    "A cidade"
  );
}

function validateState(
  state: string
): void {
  if (!state) {
    return;
  }

  if (
    !STATE_PATTERN.test(
      state
    )
  ) {
    throw new Error(
      "Informe a sigla do estado com 2 letras. Exemplo: SP."
    );
  }
}

function validateZipCode(
  zipCode: string
): void {
  if (!zipCode) {
    return;
  }

  if (
    !ZIP_CODE_PATTERN.test(
      zipCode
    )
  ) {
    throw new Error(
      "Informe um CEP válido. Exemplo: 01001-000."
    );
  }
}

function validatePhone(
  phone: string
): void {
  if (!phone) {
    return;
  }

  validateMaximumLength(
    phone,
    MAXIMUM_PHONE_LENGTH,
    "O telefone"
  );

  if (
    !PHONE_PATTERN.test(
      phone
    )
  ) {
    throw new Error(
      "Informe um telefone válido."
    );
  }
}

function validateEmail(
  email: string
): void {
  if (!email) {
    return;
  }

  validateMaximumLength(
    email,
    MAXIMUM_EMAIL_LENGTH,
    "O e-mail"
  );

  if (
    !EMAIL_PATTERN.test(
      email
    )
  ) {
    throw new Error(
      "Informe um e-mail válido."
    );
  }
}

function validateManager(
  manager: string
): void {
  validateMaximumLength(
    manager,
    MAXIMUM_MANAGER_LENGTH,
    "O gerente"
  );
}

function validateNotes(
  notes: string
): void {
  validateMaximumLength(
    notes,
    MAXIMUM_NOTES_LENGTH,
    "As observações"
  );
}

function validateStatus(
  status: StoreStatus
): void {
  if (
    !VALID_STATUSES.includes(
      status
    )
  ) {
    throw new Error(
      "Selecione um status de loja válido."
    );
  }
}

function validateStoreData(
  storeData:
    CreateStoreData
): void {
  validateStoreCode(
    storeData.code
  );

  validateStoreName(
    storeData.name
  );

  validateStatus(
    storeData.status
  );

  validateAddress(
    storeData.address
  );

  validateCity(
    storeData.city
  );

  validateState(
    storeData.state
  );

  validateZipCode(
    storeData.zipCode
  );

  validatePhone(
    storeData.phone
  );

  validateEmail(
    storeData.email
  );

  validateManager(
    storeData.manager
  );

  validateNotes(
    storeData.notes
  );
}

function ensureUniqueCode(
  code: string,
  ignoredStoreId?: number
): void {
  const existingStore =
    findStoreByCode(
      code
    );

  if (
    existingStore &&
    existingStore.id !==
      ignoredStoreId
  ) {
    throw new Error(
      "Já existe uma loja cadastrada com esse código."
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
      userId:
        null,

      userName:
        "Sistema",
    };
  }

  return {
    userId:
      currentUser.id,

    userName:
      currentUser.name,
  };
}

function registerStoreAudit(
  storeId: number,
  action:
    | "Criação"
    | "Edição"
    | "Exclusão"
    | "Alteração de status",
  description: string,
  details?: string
): void {
  const auditUser =
    getAuditUser();

  createAuditLog({
    module:
      "Lojas",

    action,

    userId:
      auditUser.userId,

    userName:
      auditUser.userName,

    entityId:
      storeId,

    description,

    details,
  });
}

function registerStoreChanges(
  currentStore: Store,
  updatedStore: Store
): void {
  const generalChanges:
    string[] = [];

  if (
    currentStore.code !==
    updatedStore.code
  ) {
    generalChanges.push(
      `Código: "${currentStore.code}" → "${updatedStore.code}"`
    );
  }

  if (
    currentStore.name !==
    updatedStore.name
  ) {
    generalChanges.push(
      `Nome: "${currentStore.name}" → "${updatedStore.name}"`
    );
  }

  if (
    currentStore.address !==
    updatedStore.address
  ) {
    generalChanges.push(
      "Endereço alterado"
    );
  }

  if (
    currentStore.city !==
    updatedStore.city
  ) {
    generalChanges.push(
      `Cidade: "${currentStore.city}" → "${updatedStore.city}"`
    );
  }

  if (
    currentStore.state !==
    updatedStore.state
  ) {
    generalChanges.push(
      `Estado: "${currentStore.state}" → "${updatedStore.state}"`
    );
  }

  if (
    currentStore.zipCode !==
    updatedStore.zipCode
  ) {
    generalChanges.push(
      "CEP alterado"
    );
  }

  if (
    currentStore.phone !==
    updatedStore.phone
  ) {
    generalChanges.push(
      "Telefone alterado"
    );
  }

  if (
    currentStore.email !==
    updatedStore.email
  ) {
    generalChanges.push(
      `E-mail: "${currentStore.email || "Não informado"}" → "${updatedStore.email || "Não informado"}"`
    );
  }

  if (
    currentStore.manager !==
    updatedStore.manager
  ) {
    generalChanges.push(
      `Responsável/Gerente: "${currentStore.manager || "Não informado"}" → "${updatedStore.manager || "Não informado"}"`
    );
  }

  if (
    currentStore.notes !==
    updatedStore.notes
  ) {
    generalChanges.push(
      "Observações alteradas"
    );
  }

  if (
    generalChanges.length >
    0
  ) {
    registerStoreAudit(
      updatedStore.id,
      "Edição",
      `Loja "${updatedStore.name}" editada.`,
      generalChanges.join(
        " | "
      )
    );
  }

  if (
    currentStore.status !==
    updatedStore.status
  ) {
    registerStoreAudit(
      updatedStore.id,
      "Alteração de status",
      updatedStore.status ===
      "Ativa"
        ? `Loja "${updatedStore.name}" ativada.`
        : `Loja "${updatedStore.name}" inativada.`,
      `"${currentStore.status}" → "${updatedStore.status}"`
    );
  }
}

export function getStores():
  Store[] {
  return findAllStores()
    .sort(
      (
        firstStore,
        secondStore
      ) =>
        firstStore.name.localeCompare(
          secondStore.name,
          "pt-BR"
        )
    );
}

export function getActiveStores():
  Store[] {
  return getStores().filter(
    (store) =>
      store.status ===
      "Ativa"
  );
}

export function getStoreById(
  storeId: number
): Store | undefined {
  if (
    !Number.isInteger(
      storeId
    ) ||
    storeId <= 0
  ) {
    return undefined;
  }

  return findStoreById(
    storeId
  );
}

export function createStore(
  storeData:
    CreateStoreData
): Store {
  const normalizedData:
    CreateStoreData = {
      code:
        normalizeCode(
          storeData.code
        ),

      name:
        normalizeText(
          storeData.name
        ),

      status:
        storeData.status,

      address:
        normalizeText(
          storeData.address
        ),

      city:
        normalizeText(
          storeData.city
        ),

      state:
        normalizeText(
          storeData.state
        ).toUpperCase(),

      zipCode:
        normalizeText(
          storeData.zipCode
        ),

      phone:
        normalizeText(
          storeData.phone
        ),

      email:
        normalizeText(
          storeData.email
        ).toLowerCase(),

      manager:
        normalizeText(
          storeData.manager
        ),

      notes:
        normalizeText(
          storeData.notes
        ),
    };

  validateStoreData(
    normalizedData
  );

  ensureUniqueCode(
    normalizedData.code
  );

  const createdStore =
    createStoreRepository(
      normalizedData
    );

  registerStoreAudit(
    createdStore.id,
    "Criação",
    `Loja "${createdStore.name}" criada.`,
    `Código: ${createdStore.code} | Cidade: ${createdStore.city} | Estado: ${createdStore.state} | Status: ${createdStore.status}`
  );

  return createdStore;
}

export function updateStore(
  storeId: number,
  storeData:
    UpdateStoreData
): Store | undefined {
  const currentStore =
    getStoreById(
      storeId
    );

  if (!currentStore) {
    return undefined;
  }

  const updatedData:
    CreateStoreData = {
      code:
        storeData.code ===
        undefined
          ? currentStore.code
          : normalizeCode(
              storeData.code
            ),

      name:
        storeData.name ===
        undefined
          ? currentStore.name
          : normalizeText(
              storeData.name
            ),

      status:
        storeData.status ??
        currentStore.status,

      address:
        storeData.address ===
        undefined
          ? currentStore.address
          : normalizeText(
              storeData.address
            ),

      city:
        storeData.city ===
        undefined
          ? currentStore.city
          : normalizeText(
              storeData.city
            ),

      state:
        storeData.state ===
        undefined
          ? currentStore.state
          : normalizeText(
              storeData.state
            ).toUpperCase(),

      zipCode:
        storeData.zipCode ===
        undefined
          ? currentStore.zipCode
          : normalizeText(
              storeData.zipCode
            ),

      phone:
        storeData.phone ===
        undefined
          ? currentStore.phone
          : normalizeText(
              storeData.phone
            ),

      email:
        storeData.email ===
        undefined
          ? currentStore.email
          : normalizeText(
              storeData.email
            ).toLowerCase(),

      manager:
        storeData.manager ===
        undefined
          ? currentStore.manager
          : normalizeText(
              storeData.manager
            ),

      notes:
        storeData.notes ===
        undefined
          ? currentStore.notes
          : normalizeText(
              storeData.notes
            ),
    };

  validateStoreData(
    updatedData
  );

  ensureUniqueCode(
    updatedData.code,
    storeId
  );

  const updatedStore =
    updateStoreById(
      storeId,
      updatedData
    );

  if (!updatedStore) {
    return undefined;
  }

  registerStoreChanges(
    currentStore,
    updatedStore
  );

  return updatedStore;
}

export function deleteStore(
  storeId: number
): boolean {
  const currentStore =
    getStoreById(
      storeId
    );

  if (!currentStore) {
    return false;
  }

  const deleted =
    deleteStoreById(
      storeId
    );

  if (
    deleted
  ) {
    registerStoreAudit(
      currentStore.id,
      "Exclusão",
      `Loja "${currentStore.name}" excluída.`,
      `Código: ${currentStore.code} | Cidade: ${currentStore.city} | Estado: ${currentStore.state} | Status: ${currentStore.status}`
    );
  }

  return deleted;
}