import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { PoolConnection } from "mysql2/promise";
import pool from "../database/mysql.js";

export type RecordEntity =
  | "categories"
  | "stores"
  | "tickets"
  | "ticket-comments"
  | "ticket-history"
  | "inventory"
  | "inventory-history"
  | "notes"
  | "note-attachments"
  | "user-history"
  | "settings"
  | "audit-logs"
  | "notifications"
  | "sla-notification-dismissals";

interface RecordRow extends RowDataPacket {
  id: number;
  entity_type: RecordEntity;
  owner_user_id: number | null;
  payload: string | Record<string, unknown>;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface StoredRecord<T = Record<string, unknown>> {
  id: number;
  ownerUserId: number | null;
  payload: T;
  createdAt: string;
  updatedAt: string;
}

function mapRow<T>(row: RecordRow): StoredRecord<T> {
  const payload = typeof row.payload === "string"
    ? JSON.parse(row.payload) as T
    : row.payload as T;
  return {
    id: Number(row.id),
    ownerUserId: row.owner_user_id === null ? null : Number(row.owner_user_id),
    payload,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function listRecords<T>(
  entity: RecordEntity,
  ownerUserId?: number,
): Promise<StoredRecord<T>[]> {
  const [rows] = ownerUserId === undefined
    ? await pool.execute<RecordRow[]>(
        "SELECT id, entity_type, owner_user_id, payload, created_at, updated_at FROM supportdesk_records WHERE entity_type = ? ORDER BY id DESC",
        [entity],
      )
    : await pool.execute<RecordRow[]>(
        "SELECT id, entity_type, owner_user_id, payload, created_at, updated_at FROM supportdesk_records WHERE entity_type = ? AND owner_user_id = ? ORDER BY id DESC",
        [entity, ownerUserId],
      );
  return rows.map(mapRow<T>);
}

export async function findRecord<T>(
  entity: RecordEntity,
  id: number,
): Promise<StoredRecord<T> | undefined> {
  const [rows] = await pool.execute<RecordRow[]>(
    "SELECT id, entity_type, owner_user_id, payload, created_at, updated_at FROM supportdesk_records WHERE entity_type = ? AND id = ? LIMIT 1",
    [entity, id],
  );
  return rows[0] ? mapRow<T>(rows[0]) : undefined;
}

/** Transaction-bound variants used by category/ticket integrity operations. */
export async function findRecordOnConnection<T>(
  connection: PoolConnection,
  entity: RecordEntity,
  id: number,
): Promise<StoredRecord<T> | undefined> {
  const [rows] = await connection.execute<RecordRow[]>(
    "SELECT id, entity_type, owner_user_id, payload, created_at, updated_at FROM supportdesk_records WHERE entity_type = ? AND id = ? LIMIT 1 FOR UPDATE",
    [entity, id],
  );
  return rows[0] ? mapRow<T>(rows[0]) : undefined;
}

export async function listRecordsOnConnection<T>(
  connection: PoolConnection,
  entity: RecordEntity,
): Promise<StoredRecord<T>[]> {
  const [rows] = await connection.execute<RecordRow[]>(
    "SELECT id, entity_type, owner_user_id, payload, created_at, updated_at FROM supportdesk_records WHERE entity_type = ? ORDER BY id DESC FOR UPDATE",
    [entity],
  );
  return rows.map(mapRow<T>);
}

export async function insertRecordOnConnection<T extends Record<string, unknown>>(
  connection: PoolConnection,
  entity: RecordEntity,
  payload: T,
  ownerUserId: number | null,
): Promise<StoredRecord<T>> {
  const [result] = await connection.execute<ResultSetHeader>(
    "INSERT INTO supportdesk_records (entity_type, owner_user_id, payload) VALUES (?, ?, ?)",
    [entity, ownerUserId, JSON.stringify(payload)],
  );
  const record = await findRecordOnConnection<T>(connection, entity, result.insertId);
  if (!record) throw new Error("Could not read the created record.");
  return record;
}

export async function replaceRecordOnConnection<T extends Record<string, unknown>>(
  connection: PoolConnection,
  entity: RecordEntity,
  id: number,
  payload: T,
): Promise<StoredRecord<T> | undefined> {
  const [result] = await connection.execute<ResultSetHeader>(
    "UPDATE supportdesk_records SET payload = ? WHERE entity_type = ? AND id = ?",
    [JSON.stringify(payload), entity, id],
  );
  return result.affectedRows ? findRecordOnConnection<T>(connection, entity, id) : undefined;
}

export async function insertRecord<T extends Record<string, unknown>>(
  entity: RecordEntity,
  payload: T,
  ownerUserId: number | null,
): Promise<StoredRecord<T>> {
  if (entity === "inventory" && payload.tagMode === "Automática") {
    const connection = await pool.getConnection();
    let insertId: number;
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute<ResultSetHeader>(
        "INSERT INTO supportdesk_records (entity_type, owner_user_id, payload) VALUES (?, ?, ?)",
        [entity, ownerUserId, JSON.stringify(payload)],
      );
      insertId = result.insertId;
      (payload as Record<string, unknown>).tag = `TI-${String(insertId).padStart(6, "0")}`;
      await connection.execute(
        "UPDATE supportdesk_records SET payload = ? WHERE entity_type = ? AND id = ?",
        [JSON.stringify(payload), entity, insertId],
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    const record = await findRecord<T>(entity, insertId);
    if (!record) throw new Error("Could not read the created record.");
    return record;
  }
  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO supportdesk_records (entity_type, owner_user_id, payload) VALUES (?, ?, ?)",
    [entity, ownerUserId, JSON.stringify(payload)],
  );
  const record = await findRecord<T>(entity, result.insertId);
  if (!record) throw new Error("Could not read the created record.");
  return record;
}

export async function replaceRecord<T extends Record<string, unknown>>(
  entity: RecordEntity,
  id: number,
  payload: T,
): Promise<StoredRecord<T> | undefined> {
  if (entity === "inventory" && payload.tagMode === "Automática") {
    (payload as Record<string, unknown>).tag = `TI-${String(id).padStart(6, "0")}`;
  }
  const [result] = await pool.execute<ResultSetHeader>(
    "UPDATE supportdesk_records SET payload = ? WHERE entity_type = ? AND id = ?",
    [JSON.stringify(payload), entity, id],
  );
  return result.affectedRows ? findRecord<T>(entity, id) : undefined;
}

export async function removeRecord(entity: RecordEntity, id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    "DELETE FROM supportdesk_records WHERE entity_type = ? AND id = ?",
    [entity, id],
  );
  return result.affectedRows > 0;
}

export async function hasRecordReference(
  entity: RecordEntity,
  field: string,
  value: number,
): Promise<boolean> {
  // `field` is selected only by the route from a fixed allowlist, never from input.
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id FROM supportdesk_records WHERE entity_type = ? AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.${field}')) = ? LIMIT 1`,
    [entity, String(value)],
  );
  return rows.length > 0;
}

export async function removeTicketAggregate(ticketId: number): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      "DELETE FROM supportdesk_records WHERE entity_type IN ('ticket-comments', 'ticket-history') AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.ticketId')) = ?",
      [String(ticketId)],
    );
    await connection.execute(
      "DELETE FROM supportdesk_records WHERE entity_type IN ('notifications', 'sla-notification-dismissals') AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.ticketId')) = ?",
      [String(ticketId)],
    );
    const [result] = await connection.execute<ResultSetHeader>(
      "DELETE FROM supportdesk_records WHERE entity_type = 'tickets' AND id = ?",
      [ticketId],
    );
    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function removeNoteAggregate(noteId: number): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      "DELETE FROM supportdesk_records WHERE entity_type = 'note-attachments' AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.noteId')) = ?",
      [String(noteId)],
    );
    const [result] = await connection.execute<ResultSetHeader>(
      "DELETE FROM supportdesk_records WHERE entity_type = 'notes' AND id = ?",
      [noteId],
    );
    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function removeInventoryAggregate(inventoryItemId: number): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      "DELETE FROM supportdesk_records WHERE entity_type = 'inventory-history' AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.inventoryItemId')) = ?",
      [String(inventoryItemId)],
    );
    const [result] = await connection.execute<ResultSetHeader>(
      "DELETE FROM supportdesk_records WHERE entity_type = 'inventory' AND id = ?",
      [inventoryItemId],
    );
    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
