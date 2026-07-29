import type {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
} from "../types/Category";

const STORAGE_KEY = "supportdesk.categories";

const initialCategories: Category[] = [
  {
    id: 1,
    name: "Hardware",
    description: "Problemas relacionados a computadores, impressoras e equipamentos.",
    color: "#1976d2",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Software",
    description: "Problemas relacionados a sistemas e aplicações.",
    color: "#2e7d32",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Rede",
    description: "Problemas de internet, VPN e infraestrutura de rede.",
    color: "#ed6c02",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function loadCategories(): Category[] {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(initialCategories)
    );

    return [...initialCategories];
  }

  return JSON.parse(data) as Category[];
}

function saveCategories(categories: Category[]): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(categories)
  );
}

export function findAll(): Category[] {
  return loadCategories();
}

export function findById(
  id: number
): Category | undefined {
  return loadCategories().find(
    (category) => category.id === id
  );
}

export function create(
  data: CreateCategoryData
): Category {
  const categories = loadCategories();

  const category: Category = {
    id:
      categories.length > 0
        ? Math.max(
            ...categories.map((c) => c.id)
          ) + 1
        : 1,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  categories.push(category);

  saveCategories(categories);

  return category;
}

export function updateById(
  id: number,
  data: UpdateCategoryData
): Category | undefined {
  const categories = loadCategories();

  const index = categories.findIndex(
    (category) => category.id === id
  );

  if (index === -1) {
    return undefined;
  }

  categories[index] = {
    ...categories[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  saveCategories(categories);

  return categories[index];
}

export function deleteById(
  id: number
): boolean {
  const categories = loadCategories();

  const filtered = categories.filter(
    (category) => category.id !== id
  );

  if (filtered.length === categories.length) {
    return false;
  }

  saveCategories(filtered);

  return true;
}