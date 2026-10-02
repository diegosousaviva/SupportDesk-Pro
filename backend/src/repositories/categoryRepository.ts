import {
  findRecord,
  listRecords,
  findRecordOnConnection,
  insertRecordOnConnection,
  listRecordsOnConnection,
  replaceRecordOnConnection,
  type StoredRecord,
} from "./recordRepository.js";
import type { Category, CategoryPayload } from "../types/category.js";
import type { PoolConnection } from "mysql2/promise";
import type { ResultSetHeader } from "mysql2";
import { normalizeCategoryName } from "../utils/categoryName.js";

function mapCategory(record: StoredRecord<CategoryPayload>): Category {
  return {
    id: record.id,
    ...record.payload,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function findAllCategories(): Promise<Category[]> {
  const records = await listRecords<CategoryPayload>("categories");
  return records.map(mapCategory);
}

export async function findCategoryById(id: number): Promise<Category | undefined> {
  const record = await findRecord<CategoryPayload>("categories", id);
  return record ? mapCategory(record) : undefined;
}

export async function findCategoryByIdOnConnection(connection: PoolConnection, id: number): Promise<Category | undefined> {
  const record = await findRecordOnConnection<CategoryPayload>(connection, "categories", id);
  return record ? mapCategory(record) : undefined;
}

export async function findCategoryByName(name: string): Promise<Category | undefined> {
  const normalizedName = normalizeCategoryName(name);
  const categories = await findAllCategories();
  return categories.find((category) => normalizeCategoryName(category.name) === normalizedName);
}

export async function findCategoryByNameOnConnection(connection: PoolConnection, name: string): Promise<Category | undefined> {
  const normalizedName = normalizeCategoryName(name);
  const categories = (await listRecordsOnConnection<CategoryPayload>(connection, "categories")).map(mapCategory);
  return categories.find((category) => normalizeCategoryName(category.name) === normalizedName);
}

export async function hasOtherCategoryWithNameOnConnection(
  connection: PoolConnection,
  name: string,
  ignoreId?: number,
): Promise<boolean> {
  const normalizedName = normalizeCategoryName(name);
  const categories = (await listRecordsOnConnection<CategoryPayload>(connection, "categories")).map(mapCategory);
  return categories.some((category) => category.id !== ignoreId
    && normalizeCategoryName(category.name) === normalizedName);
}

export async function createCategoryRecordOnConnection(connection: PoolConnection, data: CategoryPayload): Promise<Category> {
  return mapCategory(await insertRecordOnConnection(connection, "categories", { ...data }, null));
}

export async function updateCategoryRecordOnConnection(connection: PoolConnection, id: number, data: CategoryPayload): Promise<Category | undefined> {
  const record = await replaceRecordOnConnection(connection, "categories", id, { ...data });
  return record ? mapCategory(record) : undefined;
}

export async function deleteCategoryRecordOnConnection(connection: PoolConnection, id: number): Promise<boolean> {
  const [result] = await connection.execute<ResultSetHeader>(
    "DELETE FROM supportdesk_records WHERE entity_type = ? AND id = ?",
    ["categories", id],
  );
  return Number(result.affectedRows) > 0;
}

export async function hasTicketsForCategoryOnConnection(connection: PoolConnection, name: string): Promise<boolean> {
  const records = await listRecordsOnConnection<Record<string, unknown>>(connection, "tickets");
  const target = normalizeCategoryName(name);
  return records.some((record) => typeof record.payload.category === "string"
    && normalizeCategoryName(record.payload.category) === target);
}
