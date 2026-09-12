import {
  randomBytes,
} from "node:crypto";

import type {
  AuthUser,
} from "./authService.js";

import {
  findUserById,
} from "../repositories/userRepository.js";

const SESSION_DURATION_MS =
  8 * 60 * 60 * 1000;

interface Session {
  token: string;

  user: AuthUser;

  createdAt: string;

  expiresAt: string;
}

const sessions =
  new Map<
    string,
    Session
  >();

function generateToken(): string {
  return randomBytes(
    32
  ).toString(
    "hex"
  );
}

function isSessionExpired(
  session: Session
): boolean {
  return (
    Date.now() >=
    new Date(
      session.expiresAt
    ).getTime()
  );
}

function removeExpiredSessions(): void {
  for (
    const [
      token,
      session,
    ] of sessions
  ) {
    if (
      isSessionExpired(
        session
      )
    ) {
      sessions.delete(
        token
      );
    }
  }
}

export function createSession(
  user: AuthUser
): {
  token: string;

  expiresAt: string;
} {
  removeExpiredSessions();

  const token =
    generateToken();

  const createdAt =
    new Date();

  const expiresAt =
    new Date(
      createdAt.getTime() +
        SESSION_DURATION_MS
    );

  sessions.set(
    token,
    {
      token,

      user,

      createdAt:
        createdAt.toISOString(),

      expiresAt:
        expiresAt.toISOString(),
    }
  );

  return {
    token,

    expiresAt:
      expiresAt.toISOString(),
  };
}

export function getSession(
  token: string
):
  Session | null {
  removeExpiredSessions();

  const session =
    sessions.get(
      token
    );

  if (!session) {
    return null;
  }

  if (
    isSessionExpired(
      session
    )
  ) {
    sessions.delete(
      token
    );

    return null;
  }

  return session;
}

export function getSessionUser(
  token: string
):
  AuthUser | null {
  const session =
    getSession(
      token
    );

  if (!session) {
    return null;
  }

  /*
   * A sessão não deve continuar válida
   * caso o usuário tenha sido excluído
   * ou esteja inativo.
   *
   * Buscamos o usuário atual no repositório
   * em vez de confiar somente na cópia que
   * foi armazenada quando a sessão foi criada.
   */
  const currentUser =
    findUserById(
      session.user.id
    );

  if (!currentUser) {
    sessions.delete(
      token
    );

    return null;
  }

  if (
    currentUser.status !==
    "Ativo"
  ) {
    sessions.delete(
      token
    );

    return null;
  }

  /*
   * Atualiza os dados do usuário dentro
   * da sessão para refletir alterações
   * realizadas enquanto a sessão estava ativa.
   */
  const {
    password: _password,
    ...authenticatedUser
  } = currentUser;

  const refreshedUser:
    AuthUser = {
    ...authenticatedUser,
  };

  session.user =
    refreshedUser;

  return refreshedUser;
}

export function destroySession(
  token: string
): boolean {
  return sessions.delete(
    token
  );
}

export function destroyUserSessions(
  userId: number
): number {
  let removed =
    0;

  for (
    const [
      token,
      session,
    ] of sessions
  ) {
    if (
      session.user.id ===
      userId
    ) {
      sessions.delete(
        token
      );

      removed +=
        1;
    }
  }

  return removed;
}