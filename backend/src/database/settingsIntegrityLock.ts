import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import pool from "./mysql.js";

const LOCK_NAME = "supportdesk_pro_settings_integrity";
const LOCK_TIMEOUT_SECONDS = 10;

export class SettingsIntegrityLockError extends Error {
  constructor() {
    super("Não foi possível salvar as configurações compartilhadas. Tente novamente.");
    this.name = "SettingsIntegrityLockError";
  }
}

/** Serializes singleton settings writes across all backend processes. */
export async function withSettingsIntegrityLock<T>(
  operation: (connection: PoolConnection) => Promise<T>,
): Promise<T> {
  const connection = await pool.getConnection();
  let acquired = false;
  try {
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT GET_LOCK(?, ?) AS acquired",
      [LOCK_NAME, LOCK_TIMEOUT_SECONDS],
    );
    if (Number(rows[0]?.acquired) !== 1) throw new SettingsIntegrityLockError();
    acquired = true;
    await connection.beginTransaction();
    const result = await operation(connection);
    await connection.commit();
    return result;
  } catch (error) {
    try { await connection.rollback(); } catch { /* preserve the original error */ }
    throw error;
  } finally {
    if (acquired) {
      try { await connection.execute("SELECT RELEASE_LOCK(?)", [LOCK_NAME]); }
      finally { connection.release(); }
    } else {
      connection.release();
    }
  }
}
