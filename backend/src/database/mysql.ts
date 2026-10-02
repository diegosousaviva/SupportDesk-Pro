import "dotenv/config";

import mysql from "mysql2/promise";

function assertLocalTestDatabase(): void {
  const host = process.env.DB_HOST?.trim().toLowerCase();
  const database = process.env.DB_NAME?.trim();
  const port = Number(process.env.DB_PORT || 3306);
  const categoryTestModeRequested = Object.hasOwn(process.env, "SUPPORTDESK_CATEGORIES_TESTS");
  const loopback = ["localhost", "127.0.0.1", "::1"].includes(host ?? "");
  const notProduction = process.env.NODE_ENV?.toLowerCase() !== "production";

  if (categoryTestModeRequested) {
    if (
      process.env.SUPPORTDESK_CATEGORIES_TESTS !== "1" ||
      process.env.SUPPORTDESK_LOCAL_TESTS !== "1" ||
      process.env.DEV_DB_CONFIRM !== "I_UNDERSTAND_LOCAL_DATABASE_ONLY" ||
      !notProduction ||
      !loopback ||
      !Number.isSafeInteger(port) || port < 1 || port > 65535 ||
      database !== "supportdesk_pro_categories_test"
    ) {
      throw new Error("Modo de integração bloqueado: exige confirmações locais e DB_NAME exatamente supportdesk_pro_categories_test em loopback.");
    }
    return;
  }

  // Preserve the existing local-development database path outside integration mode.
  if (process.env.SUPPORTDESK_LOCAL_TESTS === "1"
    && (!loopback || database !== "supportdesk_pro_dev" || !notProduction)) {
    throw new Error("Modo de desenvolvimento local exige DB_HOST de loopback e DB_NAME=supportdesk_pro_dev.");
  }
}

assertLocalTestDatabase();

const pool = mysql.createPool({
  host:
    process.env.DB_HOST,

  port:
    Number(
      process.env.DB_PORT ||
        3306
    ),

  database:
    process.env.DB_NAME,

  user:
    process.env.DB_USER,

  password:
    process.env.DB_PASSWORD,

  waitForConnections:
    true,

  connectionLimit:
    10,

  queueLimit:
    0,
});

export default pool;
