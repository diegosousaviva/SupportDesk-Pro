import {
  create,
  deleteById,
  findAll,
  findById,
  updateById,
} from "../repositories/categoryRepository";
import type { Category, CreateCategoryData, UpdateCategoryData } from "../types/Category";

const MINIMUM_NAME_LENGTH = 3;
const MAXIMUM_NAME_LENGTH = 80;
const MAXIMUM_DESCRIPTION_LENGTH = 500;
const COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

function normalizeData<T extends CreateCategoryData | UpdateCategoryData>(data: T): T {
  return {
    ...data,
    name: data.name.trim(),
    description: data.description.trim(),
    color: data.color.trim(),
  };
}

function validateData(data: CreateCategoryData | UpdateCategoryData): void {
  if (data.name.length < MINIMUM_NAME_LENGTH || data.name.length > MAXIMUM_NAME_LENGTH) {
    throw new Error(`O nome da categoria deve possuir entre ${MINIMUM_NAME_LENGTH} e ${MAXIMUM_NAME_LENGTH} caracteres.`);
  }
  if (data.description.length > MAXIMUM_DESCRIPTION_LENGTH) {
    throw new Error(`A descrição deve possuir no máximo ${MAXIMUM_DESCRIPTION_LENGTH} caracteres.`);
  }
  if (!COLOR_PATTERN.test(data.color)) {
    throw new Error("Informe uma cor hexadecimal válida.");
  }
  if (typeof data.active !== "boolean") {
    throw new Error("Informe se a categoria está ativa.");
  }
}

function validId(id: number): boolean {
  return Number.isSafeInteger(id) && id > 0;
}

export function getCategories(): Promise<Category[]> {
  return findAll();
}

export function getCategoryById(id: number): Promise<Category | undefined> {
  return validId(id) ? findById(id) : Promise.resolve(undefined);
}

export async function createCategory(data: CreateCategoryData): Promise<Category> {
  const normalized = normalizeData(data);
  validateData(normalized);
  return create(normalized);
}

export async function updateCategory(id: number, data: UpdateCategoryData): Promise<Category | undefined> {
  if (!validId(id)) return undefined;
  const normalized = normalizeData(data);
  validateData(normalized);
  return updateById(id, normalized);
}

export function deleteCategory(id: number): Promise<boolean> {
  return validId(id) ? deleteById(id) : Promise.resolve(false);
}
