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

function createStoredSession(
  user: AuthUser,
  startedAt: string =
    new Date().toISOString()
): StoredSession {
  return {
    user,
    startedAt,
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
     * Formato novo:
     *
     * {
     *   user: {...},
     *   startedAt: "..."
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
        parsedValue
    ) {
      const storedSession =
        parsedValue as {
          user:
            unknown;

          startedAt:
            unknown;
        };

      if (
        !isValidAuthUser(
          storedSession.user
        ) ||
        typeof storedSession.startedAt !==
          "string"
      ) {
        return null;
      }

      const startedAtDate =
        new Date(
          storedSession.startedAt
        );

      if (
        Number.isNaN(
          startedAtDate.getTime()
        )
      ) {
        return null;
      }

      return {
        user:
          storedSession.user,

        startedAt:
          startedAtDate.toISOString(),
      };
    }

    /*
     * Compatibilidade com sessões antigas.
     *
     * Antes desta versão, somente o usuário era
     * armazenado diretamente.
     *
     * Quando encontrarmos esse formato antigo,
     * consideramos que a sessão começou agora.
     */
    if (
      isValidAuthUser(
        parsedValue
      )
    ) {
      return createStoredSession(
        parsedValue
      );
    }

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

export function saveSession(
  user: AuthUser,
  remember: boolean
): void {
  localStorage.removeItem(
    LOCAL_SESSION_KEY
  );

  sessionStorage.removeItem(
    TEMPORARY_SESSION_KEY
  );

  const session =
    createStoredSession(
      user
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
   * O horário inicial da sessão é preservado.
   */
  const updatedSession:
    StoredSession = {
      user,

      startedAt:
        currentSession.startedAt,
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

  return (
    session?.user ??
    null
  );
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
  return (
    getCurrentUser() !==
    null
  );
}