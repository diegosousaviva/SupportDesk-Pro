import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import pool from "./mysql.js";

const LOCK_NAME = "supportdesk_pro_category_ticket_integrity";
const LOCK_TIMEOUT_SECONDS = 10;

export class CategoryIntegrityLockError extends Error {
  readonly status = 503;

  constructor() {
    super("Não foi possível obter o bloqueio de integridade de categorias. Tente novamente.");
    this.name = "CategoryIntegrityLockError";
  }
}

/**
 * Serializes every application write that can create/rename/delete a category
 * or create/change a ticket category. GET_LOCK is connection-scoped and
 * survives COMMIT, so the same connection holds it through validation and
 * commit. All participating writes also run in one InnoDB transaction.
 */
export async function withCategoryIntegrityLock<T>(
  operation: (connection: PoolConnection) => Promise<T>,
): Promise<T> {
  const connection = await pool.getConnection();
  let acquired = false;
  try {
    const [rows] = await connection.execute<RowDataPacket[]>("SELECT GET_LOCK(?, ?) AS acquired", [LOCK_NAME, LOCK_TIMEOUT_SECONDS]);
    if (Number(rows[0]?.acquired) !== 1) throw new CategoryIntegrityLockError();
    acquired = true;
    await connection.beginTransaction();
    const result = await operation(connection);
    await connection.commit();
    return result;
  } catch (error) {
    try { await connection.rollback(); } catch { /* preserve the original failure */ }
    throw error;
  } finally {
    if (acquired) {
      try { await connection.execute("SELECT RELEASE_LOCK(?)", [LOCK_NAME]); } finally { connection.release(); }
    } else {
      connection.release();
    }
  }
}
