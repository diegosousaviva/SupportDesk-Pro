import {
  findAllCategories,
  findCategoryById,
  findCategoryByName,
  findCategoryByIdOnConnection,
  findCategoryByNameOnConnection,
  hasOtherCategoryWithNameOnConnection,
  createCategoryRecordOnConnection,
  deleteCategoryRecordOnConnection,
  hasTicketsForCategoryOnConnection,
  updateCategoryRecordOnConnection,
} from "../repositories/categoryRepository.js";
import type { Category, CategoryInput } from "../types/category.js";
import { withCategoryIntegrityLock } from "../database/categoryIntegrityLock.js";
import type { PoolConnection } from "mysql2/promise";
import { isSameCategoryName } from "../utils/categoryName.js";

const MINIMUM_NAME_LENGTH = 3;
const MAXIMUM_NAME_LENGTH = 80;
const MAXIMUM_DESCRIPTION_LENGTH = 500;
const COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export class CategoryServiceError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "CategoryServiceError";
  }
}

function validateInput(input: unknown): CategoryInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new CategoryServiceError("Informe os dados da categoria.", 400);
  }
  const value = input as Record<string, unknown>;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const description = typeof value.description === "string" ? value.description.trim() : "";
  const color = typeof value.color === "string" ? value.color.trim() : "";
  if (name.length < MINIMUM_NAME_LENGTH || name.length > MAXIMUM_NAME_LENGTH) {
    throw new CategoryServiceError(`O nome deve possuir entre ${MINIMUM_NAME_LENGTH} e ${MAXIMUM_NAME_LENGTH} caracteres.`, 400);
  }
  if (description.length > MAXIMUM_DESCRIPTION_LENGTH) {
    throw new CategoryServiceError(`A descrição deve possuir no máximo ${MAXIMUM_DESCRIPTION_LENGTH} caracteres.`, 400);
  }
  if (!COLOR_PATTERN.test(color)) throw new CategoryServiceError("Informe uma cor hexadecimal válida.", 400);
  if (typeof value.active !== "boolean") throw new CategoryServiceError("Informe se a categoria está ativa.", 400);
  return { name, description, color, active: value.active };
}

async function assertNameAvailable(connection: PoolConnection, name: string, ignoreId?: number): Promise<void> {
  if (await hasOtherCategoryWithNameOnConnection(connection, name, ignoreId)) {
    throw new CategoryServiceError("Já existe uma categoria com este nome.", 409);
  }
}

export async function listCategories(): Promise<Category[]> {
  return findAllCategories();
}

export async function getCategory(id: number): Promise<Category> {
  const category = await findCategoryById(id);
  if (!category) throw new CategoryServiceError("Categoria não encontrada.", 404);
  return category;
}

export async function createCategory(input: unknown): Promise<Category> {
  const data = validateInput(input);
  return withCategoryIntegrityLock(async (connection) => {
    await assertNameAvailable(connection, data.name);
    return createCategoryRecordOnConnection(connection, data);
  });
}

export async function updateCategory(id: number, input: unknown): Promise<Category> {
  const data = validateInput(input);
  return withCategoryIntegrityLock(async (connection) => {
    const current = await findCategoryByIdOnConnection(connection, id);
    if (!current) throw new CategoryServiceError("Categoria não encontrada.", 404);
    await assertNameAvailable(connection, data.name, id);
    if (!isSameCategoryName(current.name, data.name)
      && await hasTicketsForCategoryOnConnection(connection, current.name)) {
      throw new CategoryServiceError("A categoria não pode ser renomeada enquanto estiver vinculada a chamados.", 409);
    }
    const updated = await updateCategoryRecordOnConnection(connection, id, data);
    if (!updated) throw new CategoryServiceError("Categoria não encontrada.", 404);
    return updated;
  });
}

export async function deleteCategory(id: number): Promise<void> {
  await withCategoryIntegrityLock(async (connection) => {
    const category = await findCategoryByIdOnConnection(connection, id);
    if (!category) throw new CategoryServiceError("Categoria não encontrada.", 404);
    if (await hasTicketsForCategoryOnConnection(connection, category.name)) {
      throw new CategoryServiceError("A categoria não pode ser excluída enquanto estiver vinculada a chamados.", 409);
    }
    if (!(await deleteCategoryRecordOnConnection(connection, id))) {
      throw new CategoryServiceError("Categoria não encontrada.", 404);
    }
  });
}

export async function findActiveCategoryByName(name: string, connection?: PoolConnection): Promise<Category | undefined> {
  const category = connection
    ? await findCategoryByNameOnConnection(connection, name)
    : await findCategoryByName(name);
  return category?.active ? category : undefined;
}
