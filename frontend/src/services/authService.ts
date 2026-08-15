import type {
  User,
} from "../types/User";

import {
  createAuditLog,
} from "./auditLogService";

import {
  getUsers,
  updateUser,
} from "./userService";

import {
  isPasswordHash,
  verifyPassword,
} from "../utils/password";

const LOCAL_SESSION_KEY =
  "supportdesk-pro-auth-local";

const TEMPORARY_SESSION_KEY =
  "supportdesk-pro-auth-session";

export type AuthUser =
  Omit<
    User,
    "password"
  >;

export interface LoginData {
  email: string;

  password: string;

  remember: boolean;
}

function removePassword(
  user: User
): AuthUser {
  const {
    password:
      _password,

    ...authenticatedUser
  } = user;

  return authenticatedUser;
}

function saveSession(
  user: AuthUser,
  remember: boolean
): void {
  localStorage.removeItem(
    LOCAL_SESSION_KEY
  );

  sessionStorage.removeItem(
    TEMPORARY_SESSION_KEY
  );

  const serializedUser =
    JSON.stringify(
      user
    );

  if (remember) {
    localStorage.setItem(
      LOCAL_SESSION_KEY,
      serializedUser
    );

    return;
  }

  sessionStorage.setItem(
    TEMPORARY_SESSION_KEY,
    serializedUser
  );
}

function parseStoredUser(
  storedValue: string | null
): AuthUser | null {
  if (!storedValue) {
    return null;
  }

  try {
    const parsedUser =
      JSON.parse(
        storedValue
      ) as Partial<AuthUser>;

    if (
      typeof parsedUser.id !==
        "number" ||
      typeof parsedUser.name !==
        "string" ||
      typeof parsedUser.email !==
        "string" ||
      typeof parsedUser.role !==
        "string" ||
      typeof parsedUser.status !==
        "string"
    ) {
      return null;
    }

    return parsedUser as AuthUser;
  } catch {
    return null;
  }
}

export async function login({
  email,
  password,
  remember,
}: LoginData): Promise<AuthUser> {
  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const user =
    getUsers().find(
      (currentUser) =>
        currentUser.email
          .trim()
          .toLowerCase() ===
        normalizedEmail
    );

  if (!user) {
    throw new Error(
      "E-mail ou senha inválidos."
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

  if (
    user.status !==
    "Ativo"
  ) {
    throw new Error(
      "Este usuário está inativo e não pode acessar o sistema."
    );
  }

  let authenticatedUserData =
    user;

  /*
   * Migração automática:
   * caso a senha ainda esteja em texto puro,
   * updateUser gera e salva o hash PBKDF2.
   */
  if (
    !isPasswordHash(
      user.password
    )
  ) {
    const migratedUser =
      await updateUser(
        user.id,
        {
          password,
        }
      );

    if (migratedUser) {
      authenticatedUserData =
        migratedUser;
    }
  }

  const authenticatedUser =
    removePassword(
      authenticatedUserData
    );

  saveSession(
    authenticatedUser,
    remember
  );

  createAuditLog({
    module:
      "Autenticação",

    action:
      "Login",

    userId:
      authenticatedUser.id,

    userName:
      authenticatedUser.name,

    entityId:
      authenticatedUser.id,

    description:
      "Login realizado com sucesso.",

    details:
      `Perfil: ${authenticatedUser.role}`,
  });

  return authenticatedUser;
}

export function logout(): void {
  const currentUser =
    getCurrentUser();

  if (currentUser) {
    createAuditLog({
      module:
        "Autenticação",

      action:
        "Logout",

      userId:
        currentUser.id,

      userName:
        currentUser.name,

      entityId:
        currentUser.id,

      description:
        "Logout realizado com sucesso.",

      details:
        `Perfil: ${currentUser.role}`,
    });
  }

  localStorage.removeItem(
    LOCAL_SESSION_KEY
  );

  sessionStorage.removeItem(
    TEMPORARY_SESSION_KEY
  );
}

export function getCurrentUser():
  AuthUser | null {
  const localUser =
    parseStoredUser(
      localStorage.getItem(
        LOCAL_SESSION_KEY
      )
    );

  if (localUser) {
    return localUser;
  }

  const temporaryUser =
    parseStoredUser(
      sessionStorage.getItem(
        TEMPORARY_SESSION_KEY
      )
    );

  if (temporaryUser) {
    return temporaryUser;
  }

  return null;
}

export function isAuthenticated():
  boolean {
  return (
    getCurrentUser() !==
    null
  );
}