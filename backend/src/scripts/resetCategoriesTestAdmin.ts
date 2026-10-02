import "dotenv/config";

import pool from "../database/mysql.js";
import {
  findUserByEmail,
  updateUserById,
} from "../repositories/userRepository.js";
import { assertStrongPassword, hashPassword } from "../utils/password.js";

const TEST_DATABASE = "supportdesk_pro_categories_test";
const TEST_ADMIN_EMAIL = "integration-admin@supportdesk.test";
const EXPECTED_HOST = "127.0.0.1";
const EXPECTED_PORT = 3306;

interface DatabaseIdentityRow {
  activeDatabase: string | null;
  activeHostname: string;
  activePort: number | string;
}

function assertTestConfiguration(password: string | undefined): asserts password is string {
  const databasePort = Number(process.env.DB_PORT || EXPECTED_PORT);

  if (
    process.env.NODE_ENV?.trim().toLowerCase() === "production" ||
    process.env.DB_HOST !== EXPECTED_HOST ||
    process.env.DB_NAME !== TEST_DATABASE ||
    process.env.SUPPORTDESK_LOCAL_TESTS !== "1" ||
    process.env.SUPPORTDESK_CATEGORIES_TESTS !== "1" ||
    process.env.DEV_DB_CONFIRM !== "I_UNDERSTAND_LOCAL_DATABASE_ONLY" ||
    databasePort !== EXPECTED_PORT ||
    !password
  ) {
    throw new Error("Redefinição bloqueada: configuração local exclusiva de teste inválida.");
  }

  assertStrongPassword(password);
}

async function main(): Promise<void> {
  let connection: Awaited<ReturnType<typeof pool.getConnection>> | undefined;

  try {
    const password = process.env.TEST_ADMIN_PASSWORD;
    assertTestConfiguration(password);

    connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT DATABASE() AS activeDatabase, @@hostname AS activeHostname, @@port AS activePort",
    );
    const identity = (rows as DatabaseIdentityRow[])[0];

    if (
      identity?.activeDatabase !== TEST_DATABASE ||
      !identity.activeHostname ||
      Number(identity.activePort) !== EXPECTED_PORT
    ) {
      throw new Error("Redefinição bloqueada: a conexão não corresponde ao banco local de teste esperado.");
    }

    const user = await findUserByEmail(TEST_ADMIN_EMAIL);
    if (!user) {
      throw new Error("Redefinição bloqueada: administrador de teste não encontrado.");
    }
    if (user.role !== "Administrador") {
      throw new Error("Redefinição bloqueada: a conta de teste não possui a função de Administrador.");
    }

    const passwordHash = await hashPassword(password);
    const updatedUser = await updateUserById(user.id, {
      password: passwordHash,
      mustChangePassword: false,
    });

    if (!updatedUser) {
      throw new Error("Redefinição falhou: não foi possível atualizar o administrador de teste.");
    }

    console.log("Senha do administrador local de teste redefinida com sucesso.");
  } finally {
    try {
      connection?.release();
    } finally {
      await pool.end();
    }
  }
}

main().catch(() => {
  console.error("Falha ao redefinir a senha do administrador local de teste.");
  process.exitCode = 1;
});
