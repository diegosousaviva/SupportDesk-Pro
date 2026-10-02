import type { Category, CreateCategoryData, UpdateCategoryData } from "../types/Category";
import {
  createCategoryApi,
  deleteCategoryApi,
  getCategoryApi,
  listCategoriesApi,
  updateCategoryApi,
} from "../services/categoryApiService";

export function findAll(): Promise<Category[]> {
  return listCategoriesApi();
}

export function findById(id: number): Promise<Category | undefined> {
  return getCategoryApi(id);
}

export function create(data: CreateCategoryData): Promise<Category> {
  return createCategoryApi(data);
}

export function updateById(id: number, data: UpdateCategoryData): Promise<Category | undefined> {
  return updateCategoryApi(id, data);
}

export async function deleteById(id: number): Promise<boolean> {
  await deleteCategoryApi(id);
  return true;
}
