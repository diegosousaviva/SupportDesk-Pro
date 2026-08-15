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

function validateStoreCode(
  code: string
): void {
  if (!code) {
    throw new Error(
      "Informe o código da loja."
    );
  }

  if (
    code.length >
    20
  ) {
    throw new Error(
      "O código da loja deve possuir no máximo 20 caracteres."
    );
  }

  const validCodePattern =
    /^[A-Z0-9_-]+$/;

  if (
    !validCodePattern.test(
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
    name.length >
    100
  ) {
    throw new Error(
      "O nome da loja deve possuir no máximo 100 caracteres."
    );
  }
}

function validateEmail(
  email: string
): void {
  if (!email) {
    return;
  }

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !emailPattern.test(
      email
    )
  ) {
    throw new Error(
      "Informe um e-mail válido."
    );
  }
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
  storeData: CreateStoreData
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

  validateStoreCode(
    normalizedData.code
  );

  validateStoreName(
    normalizedData.name
  );

  validateEmail(
    normalizedData.email
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
  storeData: UpdateStoreData
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

  validateStoreCode(
    updatedData.code
  );

  validateStoreName(
    updatedData.name
  );

  validateEmail(
    updatedData.email
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

  if (deleted) {
    registerStoreAudit(
      currentStore.id,
      "Exclusão",
      `Loja "${currentStore.name}" excluída.`,
      `Código: ${currentStore.code} | Cidade: ${currentStore.city} | Estado: ${currentStore.state} | Status: ${currentStore.status}`
    );
  }

  return deleted;
}