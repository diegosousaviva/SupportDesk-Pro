import type {
  CreateUserData,
  UpdateUserData,
  User,
} from "../types/user.js";

import {
  createUserRepository,
  deleteUserById,
  findAllUsers,
  findUserByEmail,
  findUserById,
  updateUserById,
} from "../repositories/userRepository.js";

import {
  assertStrongPassword,
  hashPassword,
  verifyPassword,
} from "../utils/password.js";

import {
  destroyUserSessions,
} from "./sessionService.js";

function normalizeEmail(
  email: string
): string {
  return email
    .trim()
    .toLowerCase();
}

// ============================================================
// LISTAR USUÁRIOS
// ============================================================

export function listUsersService():
  User[] {
  return findAllUsers();
}

// ============================================================
// BUSCAR USUÁRIO POR ID
// ============================================================

export function getUserByIdService(
  id: number
): User {
  const user =
    findUserById(id);

  if (!user) {
    throw new Error(
      "Usuário não encontrado."
    );
  }

  return user;
}

// ============================================================
// BUSCAR USUÁRIO POR E-MAIL
// ============================================================

export function getUserByEmailService(
  email: string
):
  User | undefined {
  return findUserByEmail(
    normalizeEmail(
      email
    )
  );
}

// ============================================================
// CRIAR USUÁRIO
// ============================================================

export async function createUserService(
  data: CreateUserData
): Promise<User> {
  const normalizedEmail =
    normalizeEmail(
      data.email
    );

  if (
    !data.name ||
    !data.name.trim()
  ) {
    throw new Error(
      "Nome é obrigatório."
    );
  }

  if (
    !normalizedEmail
  ) {
    throw new Error(
      "E-mail é obrigatório."
    );
  }

  if (
    !data.password
  ) {
    throw new Error(
      "Senha é obrigatória."
    );
  }

  const existingUser =
    findUserByEmail(
      normalizedEmail
    );

  if (
    existingUser
  ) {
    throw new Error(
      "Já existe um usuário com este e-mail."
    );
  }

  assertStrongPassword(
    data.password
  );

  const hashedPassword =
    await hashPassword(
      data.password
    );

  return createUserRepository({
    ...data,

    name:
      data.name.trim(),

    email:
      normalizedEmail,

    password:
      hashedPassword,

    phone:
      data.phone?.trim() ??
      "",

    department:
      data.department?.trim() ??
      "",
  });
}

// ============================================================
// ATUALIZAR USUÁRIO
// ============================================================

export async function updateUserService(
  id: number,
  data: UpdateUserData
): Promise<User> {
  const currentUser =
    findUserById(id);

  if (!currentUser) {
    throw new Error(
      "Usuário não encontrado."
    );
  }

  const updateData:
    UpdateUserData = {
      ...data,
    };

  // ----------------------------------------------------------
  // Nome
  // ----------------------------------------------------------

  if (
    typeof data.name ===
    "string"
  ) {
    const normalizedName =
      data.name.trim();

    if (
      !normalizedName
    ) {
      throw new Error(
        "Nome é obrigatório."
      );
    }

    updateData.name =
      normalizedName;
  }

  // ----------------------------------------------------------
  // E-mail
  // ----------------------------------------------------------

  if (
    typeof data.email ===
    "string"
  ) {
    const normalizedEmail =
      normalizeEmail(
        data.email
      );

    if (
      !normalizedEmail
    ) {
      throw new Error(
        "E-mail é obrigatório."
      );
    }

    const existingUser =
      findUserByEmail(
        normalizedEmail
      );

    if (
      existingUser &&
      existingUser.id !== id
    ) {
      throw new Error(
        "Já existe um usuário com este e-mail."
      );
    }

    updateData.email =
      normalizedEmail;
  }

  // ----------------------------------------------------------
  // Telefone
  // ----------------------------------------------------------

  if (
    typeof data.phone ===
    "string"
  ) {
    updateData.phone =
      data.phone.trim();
  }

  // ----------------------------------------------------------
  // Departamento
  // ----------------------------------------------------------

  if (
    typeof data.department ===
    "string"
  ) {
    updateData.department =
      data.department.trim();
  }

  // ----------------------------------------------------------
  // Senha
  // ----------------------------------------------------------

  if (
    typeof data.password ===
    "string"
  ) {
    /*
     * Senha vazia significa que o administrador
     * não deseja alterar a senha atual.
     */
    if (
      data.password.length ===
      0
    ) {
      delete updateData.password;
    } else {
      assertStrongPassword(
        data.password
      );

      updateData.password =
        await hashPassword(
          data.password
        );

      /*
       * Se uma nova senha foi definida,
       * consideramos que a obrigação de
       * trocar a senha foi concluída.
       */
      updateData.mustChangePassword =
        false;
    }
  }

  // ----------------------------------------------------------
  // Atualização
  // ----------------------------------------------------------

  const updatedUser =
    updateUserById(
      id,
      updateData
    );

  if (
    !updatedUser
  ) {
    throw new Error(
      "Não foi possível atualizar o usuário."
    );
  }

  /*
   * Se os dados de autenticação do usuário foram alterados,
   * invalidamos as sessões existentes.
   *
   * Dessa forma, uma alteração de senha, perfil ou status
   * não deixa uma sessão antiga continuar indefinidamente.
   */
  const authenticationDataChanged =
    data.password !==
      undefined ||
    data.role !==
      undefined ||
    data.status !==
      undefined ||
    data.email !==
      undefined;

  if (
    authenticationDataChanged
  ) {
    destroyUserSessions(
      id
    );
  }

  return updatedUser;
}

// ============================================================
// ALTERAR A PRÓPRIA SENHA
// ============================================================

export async function changeOwnPasswordService(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<User> {
  const user =
    findUserById(
      userId
    );

  if (!user) {
    throw new Error(
      "Usuário não encontrado."
    );
  }

  if (
    user.status !==
    "Ativo"
  ) {
    throw new Error(
      "Este usuário está inativo e não pode alterar a senha."
    );
  }

  if (
    typeof currentPassword !==
      "string" ||
    currentPassword.length ===
      0
  ) {
    throw new Error(
      "A senha atual é obrigatória."
    );
  }

  if (
    typeof newPassword !==
      "string" ||
    newPassword.length ===
      0
  ) {
    throw new Error(
      "A nova senha é obrigatória."
    );
  }

  // ----------------------------------------------------------
  // Validar senha atual
  // ----------------------------------------------------------

  const currentPasswordIsValid =
    await verifyPassword(
      currentPassword,
      user.password
    );

  if (
    !currentPasswordIsValid
  ) {
    throw new Error(
      "A senha atual está incorreta."
    );
  }

  // ----------------------------------------------------------
  // Impedir reutilização da senha atual
  // ----------------------------------------------------------

  const newPasswordIsSame =
    await verifyPassword(
      newPassword,
      user.password
    );

  if (
    newPasswordIsSame
  ) {
    throw new Error(
      "A nova senha deve ser diferente da senha atual."
    );
  }

  // ----------------------------------------------------------
  // Validar força da nova senha
  // ----------------------------------------------------------

  assertStrongPassword(
    newPassword
  );

  // ----------------------------------------------------------
  // Gerar novo hash
  // ----------------------------------------------------------

  const hashedPassword =
    await hashPassword(
      newPassword
    );

  // ----------------------------------------------------------
  // Salvar nova senha
  // ----------------------------------------------------------

  const updatedUser =
    updateUserById(
      userId,
      {
        password:
          hashedPassword,

        mustChangePassword:
          false,
      }
    );

  if (
    !updatedUser
  ) {
    throw new Error(
      "Não foi possível alterar a senha."
    );
  }

  /*
   * Por segurança, todas as sessões existentes
   * são invalidadas após a alteração da senha.
   *
   * O usuário deverá autenticar novamente
   * utilizando a nova senha.
   */
  destroyUserSessions(
    userId
  );

  return updatedUser;
}

// ============================================================
// EXCLUIR USUÁRIO
// ============================================================

export function deleteUserService(
  id: number
): void {
  const user =
    findUserById(id);

  if (!user) {
    throw new Error(
      "Usuário não encontrado."
    );
  }

  const deleted =
    deleteUserById(id);

  if (
    !deleted
  ) {
    throw new Error(
      "Não foi possível excluir o usuário."
    );
  }

  /*
   * Garante que sessões existentes do usuário
   * excluído também sejam invalidadas.
   */
  destroyUserSessions(
    id
  );
}