import dotenv from "dotenv";

import {
  createUserRepository,
  findUserByEmail,
} from "../repositories/userRepository.js";

import {
  hashPassword,
} from "../utils/password.js";

dotenv.config();

async function seedAdmin(): Promise<void> {
  const email =
    process.env.ADMIN_EMAIL
      ?.trim()
      .toLowerCase();

  const password =
    process.env.ADMIN_PASSWORD;

  if (!email) {
    throw new Error(
      "ADMIN_EMAIL não foi definido no arquivo .env."
    );
  }

  if (!password) {
    throw new Error(
      "ADMIN_PASSWORD não foi definido no arquivo .env."
    );
  }

  const existingUser =
    findUserByEmail(
      email
    );

  if (existingUser) {
    console.log(
      `Usuário administrador já existe: ${existingUser.email}`
    );

    return;
  }

  const hashedPassword =
    await hashPassword(
      password
    );

  const admin =
    createUserRepository({
      name:
        process.env.ADMIN_NAME?.trim() ||
        "Administrador",

      email,

      password:
        hashedPassword,

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

      createdAt:
        new Date().toISOString(),
    });

  console.log(
    "Usuário administrador criado com sucesso."
  );

  console.log(
    `ID: ${admin.id}`
  );

  console.log(
    `E-mail: ${admin.email}`
  );

  console.log(
    `Perfil: ${admin.role}`
  );
}

seedAdmin().catch(
  (error) => {
    console.error(
      "Erro ao criar administrador:",
      error
    );

    process.exit(
      1
    );
  }
);