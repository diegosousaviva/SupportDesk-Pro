import type {
  User,
} from "../types/user.js";

import {
  createSession,
} from "./sessionService.js";

import {
  isPasswordHash,
  verifyPassword,
} from "../utils/password.js";

export interface LoginData {
  email: string;

  password: string;
}

export interface AuthUser {
  id: number;

  name: string;

  email: string;

  phone: string;

  department: string;

  role: User["role"];

  storeId?: number | null;

  status: User["status"];

  createdAt: string;

  /**
   * Indica se o usuário precisa trocar
   * a senha antes de utilizar normalmente
   * o sistema.
   */
  mustChangePassword?: boolean;
}

export interface LoginResult {
  user: AuthUser;

  token: string;

  expiresAt: string;
}

function removePassword(
  user: User
): AuthUser {
  const {
    password: _password,
    ...authenticatedUser
  } = user;

  return authenticatedUser;
}

function normalizeEmail(
  email: string
): string {
  return email
    .trim()
    .toLowerCase();
}

export async function authenticateUser(
  users: User[],
  {
    email,
    password,
  }: LoginData
): Promise<LoginResult> {
  const normalizedEmail =
    normalizeEmail(
      email
    );

  if (
    normalizedEmail.length ===
    0
  ) {
    throw new Error(
      "E-mail é obrigatório."
    );
  }

  if (
    password.length ===
    0
  ) {
    throw new Error(
      "Senha é obrigatória."
    );
  }

  const user =
    users.find(
      (currentUser) =>
        normalizeEmail(
          currentUser.email
        ) ===
        normalizedEmail
    );

  if (!user) {
    throw new Error(
      "E-mail ou senha inválidos."
    );
  }

  if (
    user.status !==
    "Ativo"
  ) {
    throw new Error(
      "Este usuário está inativo e não pode acessar o sistema."
    );
  }

  const validPassword =
    await verifyPassword(
      password,
      user.password
    );

  if (!validPassword) {
    throw new Error(
      "E-mail ou senha inválidos."
    );
  }

  /*
   * Compatibilidade com senhas antigas.
   *
   * Caso a senha ainda esteja armazenada no
   * formato legado, o login continua funcionando.
   *
   * A migração definitiva será tratada quando
   * conectarmos o backend ao armazenamento dos usuários.
   */
  const passwordIsHashed =
    isPasswordHash(
      user.password
    );

  if (!passwordIsHashed) {
    console.warn(
      `Usuário ${user.id} autenticado com senha em formato legado.`
    );
  }

  const authenticatedUser =
    removePassword(
      user
    );

  const session =
    createSession(
      authenticatedUser
    );

  return {
    user:
      authenticatedUser,

    token:
      session.token,

    expiresAt:
      session.expiresAt,
  };
}