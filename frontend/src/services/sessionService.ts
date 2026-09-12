import type {
  User,
} from "../types/User";

export type AuthUser =
  Omit<User, "password">;

const SESSION_STORAGE_KEY =
  "supportdesk-pro-session";

const LEGACY_USER_STORAGE_KEY =
  "supportdesk-pro-current-user";

const LEGACY_AUTH_STORAGE_KEY =
  "supportdesk-pro-auth";

interface StoredSession {
  user: AuthUser;

  remember: boolean;

  token: string;

  expiresAt: string;

  createdAt: string;
}

function isValidAuthUser(
  value: unknown
): value is AuthUser {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return false;
  }

  const candidate =
    value as Partial<AuthUser>;

  return (
    typeof candidate.id ===
      "number" &&
    Number.isInteger(
      candidate.id
    ) &&
    candidate.id > 0 &&
    typeof candidate.name ===
      "string" &&
    typeof candidate.email ===
      "string" &&
    typeof candidate.role ===
      "string"
  );
}

function isValidStoredSession(
  value: unknown
): value is StoredSession {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return false;
  }

  const candidate =
    value as Partial<StoredSession>;

  return (
    typeof candidate.token ===
      "string" &&
    candidate.token.length >
      0 &&
    typeof candidate.expiresAt ===
      "string" &&
    typeof candidate.remember ===
      "boolean" &&
    isValidAuthUser(
      candidate.user
    )
  );
}

function isExpired(
  expiresAt: string
): boolean {
  const timestamp =
    new Date(
      expiresAt
    ).getTime();

  if (
    Number.isNaN(
      timestamp
    )
  ) {
    return true;
  }

  return (
    Date.now() >=
    timestamp
  );
}

function readSession():
  StoredSession | null {
  const stored =
    localStorage.getItem(
      SESSION_STORAGE_KEY
    );

  if (!stored) {
    return null;
  }

  try {
    const parsed =
      JSON.parse(
        stored
      ) as unknown;

    if (
      !isValidStoredSession(
        parsed
      )
    ) {
      localStorage.removeItem(
        SESSION_STORAGE_KEY
      );

      return null;
    }

    if (
      isExpired(
        parsed.expiresAt
      )
    ) {
      localStorage.removeItem(
        SESSION_STORAGE_KEY
      );

      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(
      SESSION_STORAGE_KEY
    );

    return null;
  }
}

export function saveSession(
  user: AuthUser,
  remember: boolean,
  token: string,
  expiresAt: string
): void {
  const session:
    StoredSession = {
    user,

    remember,

    token,

    expiresAt,

    createdAt:
      new Date().toISOString(),
  };

  /*
   * O login atual sempre substitui
   * completamente a sessão anterior.
   *
   * Isso impede que o usuário anterior
   * continue aparecendo no Header.
   */
  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify(
      session
    )
  );

  /*
   * Remove formatos antigos de sessão
   * utilizados por versões anteriores.
   */
  localStorage.removeItem(
    LEGACY_USER_STORAGE_KEY
  );

  localStorage.removeItem(
    LEGACY_AUTH_STORAGE_KEY
  );
}

export function getCurrentUser():
  AuthUser | null {
  const session =
    readSession();

  return (
    session?.user ??
    null
  );
}

export function getAuthToken():
  string | null {
  const session =
    readSession();

  return (
    session?.token ??
    null
  );
}

export function getSessionExpiresAt():
  string | null {
  const session =
    readSession();

  return (
    session?.expiresAt ??
    null
  );
}

/*
 * Retorna há quanto tempo a sessão atual
 * foi criada, em milissegundos.
 *
 * Essa função é utilizada pelo
 * useSessionTimeout para acompanhar
 * a duração da sessão sem depender
 * diretamente do Header ou do AuthContext.
 */
export function getSessionElapsedMilliseconds():
  number {
  const session =
    readSession();

  if (!session) {
    return 0;
  }

  /*
   * Sessões antigas podem não possuir
   * createdAt.
   *
   * Nesse caso utilizamos o momento atual
   * como referência para evitar quebrar
   * a aplicação.
   */
  if (
    typeof session.createdAt !==
      "string"
  ) {
    return 0;
  }

  const createdAt =
    new Date(
      session.createdAt
    ).getTime();

  if (
    Number.isNaN(
      createdAt
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Date.now() -
      createdAt
  );
}

export function isAuthenticated():
  boolean {
  return (
    readSession() !==
    null
  );
}

export function updateCurrentSessionUser(
  user: AuthUser
): void {
  const session =
    readSession();

  if (!session) {
    return;
  }

  const updatedSession:
    StoredSession = {
    ...session,

    user,
  };

  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify(
      updatedSession
    )
  );
}

export function clearSession():
  void {
  localStorage.removeItem(
    SESSION_STORAGE_KEY
  );

  localStorage.removeItem(
    LEGACY_USER_STORAGE_KEY
  );

  localStorage.removeItem(
    LEGACY_AUTH_STORAGE_KEY
  );
}