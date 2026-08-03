import type {
  Store,
} from "../types/Store";

const STORAGE_KEY =
  "supportdesk-pro-stores";

const initialStores: Store[] = [
  {
    id: 1,
    code: "LJ001",
    name: "Matriz",
    status: "Ativa",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    manager: "",
    notes: "",
    createdAt:
      new Date().toISOString(),
    updatedAt:
      new Date().toISOString(),
  },
  {
    id: 2,
    code: "LJ002",
    name: "Loja Centro",
    status: "Ativa",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    manager: "",
    notes: "",
    createdAt:
      new Date().toISOString(),
    updatedAt:
      new Date().toISOString(),
  },
  {
    id: 3,
    code: "LJ003",
    name: "Loja Norte",
    status: "Ativa",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    manager: "",
    notes: "",
    createdAt:
      new Date().toISOString(),
    updatedAt:
      new Date().toISOString(),
  },
  {
    id: 4,
    code: "LJ004",
    name: "Loja Sul",
    status: "Ativa",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    manager: "",
    notes: "",
    createdAt:
      new Date().toISOString(),
    updatedAt:
      new Date().toISOString(),
  },
];

function saveStores(
  stores: Store[]
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      stores
    )
  );
}

function loadStores(): Store[] {
  const storedStores =
    localStorage.getItem(
      STORAGE_KEY
    );

  if (!storedStores) {
    saveStores(
      initialStores
    );

    return initialStores;
  }

  try {
    const parsedStores =
      JSON.parse(
        storedStores
      ) as Store[];

    if (
      !Array.isArray(
        parsedStores
      )
    ) {
      saveStores(
        initialStores
      );

      return initialStores;
    }

    return parsedStores;
  } catch {
    saveStores(
      initialStores
    );

    return initialStores;
  }
}

export function findAllStores(): Store[] {
  return loadStores();
}

export function findStoreById(
  storeId: number
): Store | undefined {
  return loadStores().find(
    (store) =>
      store.id === storeId
  );
}

export function findStoreByCode(
  code: string
): Store | undefined {
  const normalizedCode =
    code.trim().toLocaleLowerCase(
      "pt-BR"
    );

  return loadStores().find(
    (store) =>
      store.code
        .trim()
        .toLocaleLowerCase(
          "pt-BR"
        ) === normalizedCode
  );
}

export function createStore(
  storeData: Omit<
    Store,
    | "id"
    | "createdAt"
    | "updatedAt"
  >
): Store {
  const stores =
    loadStores();

  const highestId =
    stores.reduce(
      (
        currentHighestId,
        store
      ) =>
        Math.max(
          currentHighestId,
          store.id
        ),
      0
    );

  const currentDate =
    new Date().toISOString();

  const newStore: Store = {
    ...storeData,
    id: highestId + 1,
    createdAt:
      currentDate,
    updatedAt:
      currentDate,
  };

  saveStores([
    ...stores,
    newStore,
  ]);

  return newStore;
}

export function updateStoreById(
  storeId: number,
  storeData: Partial<
    Omit<
      Store,
      | "id"
      | "createdAt"
      | "updatedAt"
    >
  >
): Store | undefined {
  const stores =
    loadStores();

  let updatedStore:
    Store | undefined;

  const updatedStores =
    stores.map(
      (store) => {
        if (
          store.id !==
          storeId
        ) {
          return store;
        }

        updatedStore = {
          ...store,
          ...storeData,
          updatedAt:
            new Date().toISOString(),
        };

        return updatedStore;
      }
    );

  saveStores(
    updatedStores
  );

  return updatedStore;
}

export function deleteStoreById(
  storeId: number
): boolean {
  const stores =
    loadStores();

  const updatedStores =
    stores.filter(
      (store) =>
        store.id !== storeId
    );

  if (
    updatedStores.length ===
    stores.length
  ) {
    return false;
  }

  saveStores(
    updatedStores
  );

  return true;
}