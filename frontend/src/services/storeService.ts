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

function validateStoreCode(
  code: string
): void {
  if (!code) {
    throw new Error(
      "Informe o código da loja."
    );
  }

  if (code.length > 20) {
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

  if (name.length > 100) {
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

export function getStores(): Store[] {
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

export function getActiveStores(): Store[] {
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
  const normalizedData: CreateStoreData =
    {
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

  return createStoreRepository(
    normalizedData
  );
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

  const updatedData: CreateStoreData =
    {
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

  return updateStoreById(
    storeId,
    updatedData
  );
}

export function deleteStore(
  storeId: number
): boolean {
  return deleteStoreById(
    storeId
  );
}