import "dotenv/config";

import {
  createUserRepository,
  findUserByEmail,
} from "../repositories/userRepository.js";
import pool from "../database/mysql.js";
import { assertStrongPassword, hashPassword } from "../utils/password.js";

const dedicatedTestModeRequested = Object.hasOwn(process.env, "SUPPORTDESK_CATEGORIES_TESTS")
  || process.env.npm_lifecycle_event === "test:create-admin"
  || process.argv.includes("--categories-test");

function assertDevelopmentOnly(): void {
  const host = process.env.DB_HOST?.trim().toLowerCase();
  const database = process.env.DB_NAME?.trim();
  const loopback = ["localhost", "127.0.0.1", "::1"].includes(host ?? "");
  const notProduction = process.env.NODE_ENV?.toLowerCase() !== "production";

  if (dedicatedTestModeRequested) {
    if (
      process.env.SUPPORTDESK_CATEGORIES_TESTS !== "1" ||
      process.env.SUPPORTDESK_LOCAL_TESTS !== "1" ||
      process.env.DEV_DB_CONFIRM !== "I_UNDERSTAND_LOCAL_DATABASE_ONLY" ||
      !notProduction ||
      !loopback ||
      database !== "supportdesk_pro_categories_test"
    ) {
      throw new Error("Provisionamento de teste bloqueado: use somente supportdesk_pro_categories_test em loopback com todas as confirmações.");
    }
    return;
  }

  if (
    process.env.SUPPORTDESK_LOCAL_TESTS !== "1" ||
    process.env.DEV_DB_CONFIRM !== "I_UNDERSTAND_LOCAL_DATABASE_ONLY" ||
    !notProduction ||
    !loopback ||
    database !== "supportdesk_pro_dev"
  ) {
    throw new Error("Criação bloqueada: configure e confirme explicitamente o banco supportdesk_pro_dev em loopback.");
  }
}

async function main(): Promise<void> {
  assertDevelopmentOnly();
  const dedicatedTestMode = dedicatedTestModeRequested;
  const email = (dedicatedTestMode ? process.env.TEST_ADMIN_EMAIL : process.env.DEV_ADMIN_EMAIL)?.trim().toLowerCase();
  const password = dedicatedTestMode ? process.env.TEST_ADMIN_PASSWORD : process.env.DEV_ADMIN_PASSWORD;
  const name = (dedicatedTestMode ? process.env.TEST_ADMIN_NAME : process.env.DEV_ADMIN_NAME)?.trim();
  if (!email || !password || !name) {
    throw new Error(dedicatedTestMode
      ? "Defina TEST_ADMIN_NAME, TEST_ADMIN_EMAIL e TEST_ADMIN_PASSWORD exclusivos para testes locais."
      : "Defina DEV_ADMIN_NAME, DEV_ADMIN_EMAIL e DEV_ADMIN_PASSWORD no .env local.");
  }
  if (dedicatedTestMode && !email.endsWith("@supportdesk.test")) {
    throw new Error("O administrador de teste deve usar um endereço local terminado em @supportdesk.test.");
  }
  if (dedicatedTestMode && (
    email === process.env.DEV_ADMIN_EMAIL?.trim().toLowerCase() ||
    password === process.env.DEV_ADMIN_PASSWORD
  )) {
    throw new Error("Use credenciais exclusivas para o administrador de teste, diferentes das credenciais de desenvolvimento local.");
  }
  assertStrongPassword(password);

  const existing = await findUserByEmail(email);
  if (existing) {
    console.log("O administrador de desenvolvimento já existe; nenhuma conta foi alterada.");
    return;
  }

  await createUserRepository({
    name,
    email,
    password: await hashPassword(password),
    phone: "",
    department: "Desenvolvimento",
    role: "Administrador",
    storeId: null,
    status: "Ativo",
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
  });
  console.log("Administrador de desenvolvimento criado.");
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Falha ao criar administrador de desenvolvimento.";
    console.error(message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
