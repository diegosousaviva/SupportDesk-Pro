import {
  create,
  deleteById,
  findAll,
  findById,
  updateById,
} from "../repositories/categoryRepository";

import type {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
} from "../types/Category";

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function validateName(
  name: string,
  ignoreId?: number
): void {
  const normalized = normalizeName(name);

  if (!normalized) {
    throw new Error(
      "Informe o nome da categoria."
    );
  }

  const exists = findAll().find(
    (category) =>
      normalizeName(category.name) === normalized &&
      category.id !== ignoreId
  );

  if (exists) {
    throw new Error(
      "Já existe uma categoria com este nome."
    );
  }
}

export function getCategories(): Category[] {
  return findAll();
}

export function getCategoryById(
  id: number
): Category | undefined {
  return findById(id);
}

export async function createCategory(
  data: CreateCategoryData
): Promise<Category> {
  validateName(data.name);

  return create({
    ...data,
    name: data.name.trim(),
    description: data.description.trim(),
  });
}

export async function updateCategory(
  id: number,
  data: UpdateCategoryData
): Promise<Category | undefined> {
  validateName(data.name, id);

  return updateById(id, {
    ...data,
    name: data.name.trim(),
    description: data.description.trim(),
  });
}

export function deleteCategory(
  id: number
): boolean {
  return deleteById(id);
}