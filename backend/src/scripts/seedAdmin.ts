import dotenv from "dotenv";

import {
  createUserRepository,
  findUserByEmail,
} from "../repositories/userRepository.js";

import {
  hashPassword,
} from "../utils/password.js";

dotenv.config();

interface SeedUserData {
  name: string;

  email: string;

  password: string;

  phone: string;

  department: string;

  role:
    | "Administrador"
    | "Técnico"
    | "Solicitante";

  storeId: number | null;

  status:
    | "Ativo"
    | "Inativo";
}

async function createUserIfNotExists(
  data: SeedUserData
): Promise<void> {
  const normalizedEmail =
    data.email
      .trim()
      .toLowerCase();

  const existingUser =
    findUserByEmail(
      normalizedEmail
    );

  if (existingUser) {
    console.log(
      `Usuário já existe: ${existingUser.email}`
    );

    return;
  }

  const hashedPassword =
    await hashPassword(
      data.password
    );

  const user =
    createUserRepository({
      name:
        data.name.trim(),

      email:
        normalizedEmail,

      password:
        hashedPassword,

      phone:
        data.phone.trim(),

      department:
        data.department.trim(),

      role:
        data.role,

      storeId:
        data.role ===
        "Solicitante"
          ? data.storeId
          : null,

      status:
        data.status,

      createdAt:
        new Date().toISOString(),
    });

  console.log(
    "Usuário criado com sucesso:"
  );

  console.log(
    `  ID: ${user.id}`
  );

  console.log(
    `  Nome: ${user.name}`
  );

  console.log(
    `  E-mail: ${user.email}`
  );

  console.log(
    `  Perfil: ${user.role}`
  );
}

async function seedUsers(): Promise<void> {
  const adminEmail =
    process.env.ADMIN_EMAIL
      ?.trim()
      .toLowerCase();

  const adminPassword =
    process.env.ADMIN_PASSWORD;

  if (!adminEmail) {
    throw new Error(
      "ADMIN_EMAIL não foi definido no arquivo .env."
    );
  }

  if (!adminPassword) {
    throw new Error(
      "ADMIN_PASSWORD não foi definido no arquivo .env."
    );
  }

  /*
   * Administrador principal.
   *
   * Os dados vêm do arquivo .env para que a conta
   * administrativa continue utilizando a configuração
   * atual do sistema.
   */
  await createUserIfNotExists({
    name:
      process.env.ADMIN_NAME?.trim() ||
      "Administrador",

    email:
      adminEmail,

    password:
      adminPassword,

    phone:
      process.env.ADMIN_PHONE?.trim() ||
      "",

    department:
      process.env.ADMIN_DEPARTMENT?.trim() ||
      "Tecnologia",

    role:
      "Administrador",

    storeId:
      null,

    status:
      "Ativo",
  });

  /*
   * Usuário Técnico de demonstração.
   *
   * Esta conta existia anteriormente apenas no frontend.
   * Agora ela também será criada no backend, utilizando
   * hash PBKDF2 para a senha.
   */
  await createUserIfNotExists({
    name:
      "Carlos Oliveira",

    email:
      "carlos@supportdesk.com",

    password:
      "Tecnico@123",

    phone:
      "(11) 99999-0002",

    department:
      "Suporte",

    role:
      "Técnico",

    storeId:
      null,

    status:
      "Ativo",
  });

  /*
   * Usuário Solicitante de demonstração.
   *
   * Esta conta também será criada no backend.
   */
  await createUserIfNotExists({
    name:
      "Mariana Souza",

    email:
      "mariana@supportdesk.com",

    password:
      "Solicitante@123",

    phone:
      "(11) 99999-0003",

    department:
      "Financeiro",

    role:
      "Solicitante",

    storeId:
      null,

    status:
      "Ativo",
  });

  console.log(
    "Seed de usuários concluído."
  );
}

seedUsers().catch(
  (error) => {
    console.error(
      "Erro ao criar usuários:",
      error
    );

    process.exit(
      1
    );
  }
);