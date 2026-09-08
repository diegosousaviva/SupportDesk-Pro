import type {
  User,
} from "../types/User";

const LOCAL_SESSION_KEY =
  "supportdesk-pro-auth-local";

const TEMPORARY_SESSION_KEY =
  "supportdesk-pro-auth-session";

export type AuthUser =
  Omit<
    User,
    "password"
  >;

interface StoredSession {
  user: AuthUser;

  startedAt: string;

  token: string;

  expiresAt: string;
}

function isValidAuthUser(
  value: unknown
): value is AuthUser {
  if (
    typeof value !==
      "object" ||
    value === null
  ) {
    return false;
  }

  const user =
    value as Partial<AuthUser>;

  return (
    typeof user.id ===
      "number" &&
    typeof user.name ===
      "string" &&
    typeof user.email ===
      "string" &&
    typeof user.role ===
      "string" &&
    typeof user.status ===
      "string"
  );
}

function isValidDateString(
  value: unknown
): value is string {
  if (
    typeof value !==
    "string"
  ) {
    return false;
  }

  const date =
    new Date(
      value
    );

  return !Number.isNaN(
    date.getTime()
  );
}

function createStoredSession(
  user: AuthUser,
  token: string,
  expiresAt: string,
  startedAt: string =
    new Date().toISOString()
): StoredSession {
  return {
    user,

    startedAt,

    token,

    expiresAt,
  };
}

function parseStoredSession(
  storedValue:
    string | null
): StoredSession | null {
  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue:
      unknown =
      JSON.parse(
        storedValue
      );

    /*
     * Formato atual:
     *
     * {
     *   user: {...},
     *   startedAt: "...",
     *   token: "...",
     *   expiresAt: "..."
     * }
     */
    if (
      typeof parsedValue ===
        "object" &&
      parsedValue !==
        null &&
      "user" in
        parsedValue &&
      "startedAt" in
        parsedValue &&
      "token" in
        parsedValue &&
      "expiresAt" in
        parsedValue
    ) {
      const storedSession =
        parsedValue as {
          user:
            unknown;

          startedAt:
            unknown;

          token:
            unknown;

          expiresAt:
            unknown;
        };

      if (
        !isValidAuthUser(
          storedSession.user
        )
      ) {
        return null;
      }

      if (
        typeof storedSession.startedAt !==
        "string"
      ) {
        return null;
      }

      if (
        typeof storedSession.token !==
        "string" ||
        storedSession.token.trim()
          .length === 0
      ) {
        return null;
      }

      if (
        !isValidDateString(
          storedSession.startedAt
        )
      ) {
        return null;
      }

      if (
        !isValidDateString(
          storedSession.expiresAt
        )
      ) {
        return null;
      }

      return {
        user:
          storedSession.user,

        startedAt:
          new Date(
            storedSession.startedAt
          ).toISOString(),

        token:
          storedSession.token,

        expiresAt:
          new Date(
            storedSession.expiresAt
          ).toISOString(),
      };
    }

    /*
     * Compatibilidade com sessões antigas.
     *
     * Sessões antigas não possuem token.
     *
     * Como agora a autenticação depende do token
     * emitido pelo backend, essas sessões não podem
     * ser utilizadas para chamadas autenticadas.
     *
     * Retornamos null para forçar um novo login.
     */
    return null;
  } catch {
    return null;
  }
}

function getSessionStorageType():
  "local" | "session" | null {
  const localSession =
    localStorage.getItem(
      LOCAL_SESSION_KEY
    );

  if (localSession) {
    return "local";
  }

  const temporarySession =
    sessionStorage.getItem(
      TEMPORARY_SESSION_KEY
    );

  if (temporarySession) {
    return "session";
  }

  return null;
}

function getStoredSession():
  StoredSession | null {
  const localSession =
    parseStoredSession(
      localStorage.getItem(
        LOCAL_SESSION_KEY
      )
    );

  if (localSession) {
    return localSession;
  }

  const temporarySession =
    parseStoredSession(
      sessionStorage.getItem(
        TEMPORARY_SESSION_KEY
      )
    );

  if (temporarySession) {
    return temporarySession;
  }

  return null;
}

function isSessionExpired(
  session: StoredSession
): boolean {
  const expiresAt =
    new Date(
      session.expiresAt
    );

  if (
    Number.isNaN(
      expiresAt.getTime()
    )
  ) {
    return true;
  }

  return (
    Date.now() >=
    expiresAt.getTime()
  );
}

export function saveSession(
  user: AuthUser,
  remember: boolean,
  token: string,
  expiresAt: string
): void {
  localStorage.removeItem(
    LOCAL_SESSION_KEY
  );

  sessionStorage.removeItem(
    TEMPORARY_SESSION_KEY
  );

  const session =
    createStoredSession(
      user,
      token,
      expiresAt
    );

  const serializedSession =
    JSON.stringify(
      session
    );

  if (remember) {
    localStorage.setItem(
      LOCAL_SESSION_KEY,
      serializedSession
    );

    return;
  }

  sessionStorage.setItem(
    TEMPORARY_SESSION_KEY,
    serializedSession
  );
}

export function updateCurrentSessionUser(
  user: AuthUser
): void {
  const storageType =
    getSessionStorageType();

  if (!storageType) {
    return;
  }

  const currentSession =
    getStoredSession();

  if (!currentSession) {
    return;
  }

  /*
   * Atualizamos somente os dados do usuário.
   *
   * O horário inicial da sessão,
   * token e validade são preservados.
   */
  const updatedSession:
    StoredSession = {
    user,

    startedAt:
      currentSession.startedAt,

    token:
      currentSession.token,

    expiresAt:
      currentSession.expiresAt,
  };

  const serializedSession =
    JSON.stringify(
      updatedSession
    );

  if (
    storageType ===
    "local"
  ) {
    localStorage.setItem(
      LOCAL_SESSION_KEY,
      serializedSession
    );

    return;
  }

  sessionStorage.setItem(
    TEMPORARY_SESSION_KEY,
    serializedSession
  );
}

export function clearSession():
  void {
  localStorage.removeItem(
    LOCAL_SESSION_KEY
  );

  sessionStorage.removeItem(
    TEMPORARY_SESSION_KEY
  );
}

export function getCurrentUser():
  AuthUser | null {
  const session =
    getStoredSession();

  if (!session) {
    return null;
  }

  if (
    isSessionExpired(
      session
    )
  ) {
    clearSession();

    return null;
  }

  return session.user;
}

export function getAuthToken():
  string | null {
  const session =
    getStoredSession();

  if (!session) {
    return null;
  }

  if (
    isSessionExpired(
      session
    )
  ) {
    clearSession();

    return null;
  }

  return session.token;
}

export function getSessionExpiresAt():
  string | null {
  const session =
    getStoredSession();

  if (!session) {
    return null;
  }

  if (
    isSessionExpired(
      session
    )
  ) {
    clearSession();

    return null;
  }

  return session.expiresAt;
}

export function getSessionStartedAt():
  string | null {
  const session =
    getStoredSession();

  return (
    session?.startedAt ??
    null
  );
}

export function getSessionElapsedMilliseconds():
  number | null {
  const startedAt =
    getSessionStartedAt();

  if (!startedAt) {
    return null;
  }

  const startedAtDate =
    new Date(
      startedAt
    );

  if (
    Number.isNaN(
      startedAtDate.getTime()
    )
  ) {
    return null;
  }

  return Math.max(
    0,
    Date.now() -
      startedAtDate.getTime()
  );
}

export function isAuthenticated():
  boolean {
  const session =
    getStoredSession();

  if (!session) {
    return false;
  }

  if (
    isSessionExpired(
      session
    )
  ) {
    clearSession();

    return false;
  }

  return true;
}