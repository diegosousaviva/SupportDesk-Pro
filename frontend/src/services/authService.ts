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
  getAuthToken,
  getCurrentUser as getCurrentUserFromSession,
  isAuthenticated as isAuthenticatedFromSession,
  saveSession,
} from "./sessionService";

import type {
  AuthUser,
} from "./sessionService";

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

interface LoginApiResponse {
  success: boolean;

  message: string;

  token?: string;

  expiresAt?: string;

  user?: AuthUser;
}

interface ChangePasswordApiResponse {
  success: boolean;

  message: string;

  user?: AuthUser;
}

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

function normalizeEmail(
  email: string
): string {
  return email
    .trim()
    .toLowerCase();
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

async function parseApiResponse(
  response: Response
): Promise<LoginApiResponse> {
  try {
    const data =
      (await response.json()) as LoginApiResponse;

    return data;
  } catch {
    return {
      success:
        false,

      message:
        "Resposta inválida recebida do servidor.",
    };
  }
}

async function parseChangePasswordResponse(
  response: Response
): Promise<ChangePasswordApiResponse> {
  try {
    const data =
      (await response.json()) as ChangePasswordApiResponse;

    return data;
  } catch {
    return {
      success:
        false,

      message:
        "Resposta inválida recebida do servidor.",
    };
  }
}

// ============================================================
// LOGIN
// ============================================================

export async function login({
  email,
  password,
  remember,
}: LoginData): Promise<AuthUser> {
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

  let response: Response;

  try {
    response =
      await fetch(
        `${API_URL}/api/auth/login`,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              email:
                normalizedEmail,

              password,
            }),
        }
      );
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor de autenticação. Verifique se o backend está em execução."
    );
  }

  const result =
    await parseApiResponse(
      response
    );

  if (
    !response.ok ||
    !result.success
  ) {
    if (
      response.status ===
        401 ||
      result.message ===
        "E-mail ou senha inválidos."
    ) {
      registerInvalidCredentials(
        normalizedEmail
      );
    }

    throw new Error(
      result.message ||
        "Não foi possível realizar o login."
    );
  }

  if (
    !result.user ||
    !result.token ||
    !result.expiresAt
  ) {
    throw new Error(
      "O servidor não retornou os dados necessários para criar a sessão."
    );
  }

  resetLoginAttempts(
    normalizedEmail
  );

  saveSession(
    result.user,
    remember,
    result.token,
    result.expiresAt
  );

  createAuditLog({
    module:
      "Autenticação",

    action:
      "Login",

    userId:
      result.user.id,

    userName:
      result.user.name,

    entityId:
      result.user.id,

    description:
      "Login realizado com sucesso.",

    details:
      `Perfil: ${result.user.role}`,
  });

  return result.user;
}

// ============================================================
// ALTERAR PRÓPRIA SENHA
// ============================================================

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<AuthUser> {
  if (
    currentPassword.length ===
    0
  ) {
    throw new Error(
      "A senha atual é obrigatória."
    );
  }

  if (
    newPassword.length ===
    0
  ) {
    throw new Error(
      "A nova senha é obrigatória."
    );
  }

  const token =
    getAuthToken();

  if (!token) {
    throw new Error(
      "Sua sessão não está autenticada. Faça login novamente."
    );
  }

  let response: Response;

  try {
    response =
      await fetch(
        `${API_URL}/api/auth/change-password`,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body:
            JSON.stringify({
              currentPassword,

              newPassword,
            }),
        }
      );
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor de autenticação. Verifique se o backend está em execução."
    );
  }

  const result =
    await parseChangePasswordResponse(
      response
    );

  if (
    !response.ok ||
    !result.success
  ) {
    throw new Error(
      result.message ||
        "Não foi possível alterar a senha."
    );
  }

  if (
    !result.user
  ) {
    throw new Error(
      "O servidor não retornou os dados do usuário após a alteração da senha."
    );
  }

  const currentUser =
    getCurrentUserFromSession();

  createAuditLog({
    module:
      "Autenticação",

    action:
      "Senha alterada",

    userId:
      result.user.id,

    userName:
      result.user.name,

    entityId:
      result.user.id,

    description:
      "Senha alterada com sucesso.",

    details:
      currentUser?.mustChangePassword ===
      true
        ? "Troca obrigatória de senha concluída no primeiro acesso."
        : "Senha alterada pelo próprio usuário.",
  });

  /*
   * O backend invalida as sessões existentes
   * depois da alteração da senha.
   *
   * Portanto, o token utilizado nesta requisição
   * deixa de ser válido e a sessão local também
   * deve ser removida.
   *
   * O usuário fará um novo login utilizando
   * a nova senha.
   */
  clearSession();

  return result.user;
}

// ============================================================
// LOGOUT
// ============================================================

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

// ============================================================
// USUÁRIO ATUAL
// ============================================================

export function getCurrentUser():
  AuthUser | null {
  return getCurrentUserFromSession();
}

// ============================================================
// AUTENTICAÇÃO
// ============================================================

export function isAuthenticated():
  boolean {
  return isAuthenticatedFromSession();
}

// ============================================================
// TOKEN
// ============================================================

export function getToken():
  string | null {
  return getAuthToken();
}