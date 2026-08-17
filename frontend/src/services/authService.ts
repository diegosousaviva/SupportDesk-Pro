import type {
  User,
} from "../types/User";

import {
  createAuditLog,
} from "./auditLogService";

import {
  formatLoginBlockTime,
  getRemainingBlockMilliseconds,
  isLoginBlocked,
  registerFailedLoginAttempt,
  resetLoginAttempts,
} from "./loginAttemptService";

import {
  clearSession,
  getCurrentUser as getCurrentUserFromSession,
  isAuthenticated as isAuthenticatedFromSession,
  saveSession,
} from "./sessionService";

import type {
  AuthUser,
} from "./sessionService";

import {
  getUsers,
  updateUser,
} from "./userService";

import {
  isPasswordHash,
  verifyPassword,
} from "../utils/password";

export type {
  AuthUser,
} from "./sessionService";

export type LogoutReason =
  | "manual"
  | "inactivity"
  | "maximum_duration"
  | "user_inactive"
  | "user_deleted";

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

function registerLoginFailureAudit(
  email: string
): void {
  createAuditLog({
    module:
      "Autenticação",

    action:
      "Falha de login",

    userId:
      null,

    userName:
      "Não autenticado",

    entityId:
      null,

    description:
      "Tentativa de login com credenciais inválidas.",

    details:
      `E-mail informado: ${email}`,
  });
}

function registerLoginBlockAudit(
  email: string,
  remainingMilliseconds: number
): void {
  createAuditLog({
    module:
      "Autenticação",

    action:
      "Bloqueio de login",

    userId:
      null,

    userName:
      "Não autenticado",

    entityId:
      null,

    description:
      "Login temporariamente bloqueado após excesso de tentativas inválidas.",

    details:
      `E-mail informado: ${email} | Tempo restante: ${formatLoginBlockTime(
        remainingMilliseconds
      )}`,
  });
}

function throwBlockedLoginError(
  email: string,
  registerAudit: boolean
): never {
  const remainingMilliseconds =
    getRemainingBlockMilliseconds(
      email
    );

  if (registerAudit) {
    registerLoginBlockAudit(
      email,
      remainingMilliseconds
    );
  }

  throw new Error(
    `Muitas tentativas de login foram realizadas. Tente novamente em ${formatLoginBlockTime(
      remainingMilliseconds
    )}.`
  );
}

function registerInvalidCredentials(
  email: string
): never {
  registerLoginFailureAudit(
    email
  );

  registerFailedLoginAttempt(
    email
  );

  if (
    isLoginBlocked(
      email
    )
  ) {
    throwBlockedLoginError(
      email,
      true
    );
  }

  throw new Error(
    "E-mail ou senha inválidos."
  );
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

  if (
    isLoginBlocked(
      normalizedEmail
    )
  ) {
    throwBlockedLoginError(
      normalizedEmail,
      true
    );
  }

  const user =
    getUsers().find(
      (currentUser) =>
        currentUser.email
          .trim()
          .toLowerCase() ===
        normalizedEmail
    );

  if (!user) {
    registerInvalidCredentials(
      normalizedEmail
    );
  }

  const validPassword =
    await verifyPassword(
      password,
      user.password
    );

  if (!validPassword) {
    registerInvalidCredentials(
      normalizedEmail
    );
  }

  resetLoginAttempts(
    normalizedEmail
  );

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

export function logout(
  reason: LogoutReason =
    "manual"
): void {
  const currentUser =
    getCurrentUserFromSession();

  if (currentUser) {
    if (
      reason ===
      "inactivity"
    ) {
      createAuditLog({
        module:
          "Autenticação",

        action:
          "Sessão expirada",

        userId:
          currentUser.id,

        userName:
          currentUser.name,

        entityId:
          currentUser.id,

        description:
          "Sessão encerrada automaticamente por inatividade.",

        details:
          `Perfil: ${currentUser.role}`,
      });
    } else if (
      reason ===
      "maximum_duration"
    ) {
      createAuditLog({
        module:
          "Autenticação",

        action:
          "Sessão expirada",

        userId:
          currentUser.id,

        userName:
          currentUser.name,

        entityId:
          currentUser.id,

        description:
          "Sessão encerrada após atingir a duração máxima permitida.",

        details:
          `Perfil: ${currentUser.role}`,
      });
    } else if (
      reason ===
      "user_inactive"
    ) {
      createAuditLog({
        module:
          "Autenticação",

        action:
          "Sessão invalidada",

        userId:
          currentUser.id,

        userName:
          currentUser.name,

        entityId:
          currentUser.id,

        description:
          "Sessão invalidada porque o usuário foi inativado.",

        details:
          `Perfil: ${currentUser.role}`,
      });
    } else if (
      reason ===
      "user_deleted"
    ) {
      createAuditLog({
        module:
          "Autenticação",

        action:
          "Sessão invalidada",

        userId:
          currentUser.id,

        userName:
          currentUser.name,

        entityId:
          currentUser.id,

        description:
          "Sessão invalidada porque o usuário não existe mais.",

        details:
          `Perfil: ${currentUser.role}`,
      });
    } else {
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
  }

  clearSession();
}

export function getCurrentUser():
  AuthUser | null {
  return getCurrentUserFromSession();
}

export function isAuthenticated():
  boolean {
  return isAuthenticatedFromSession();
}