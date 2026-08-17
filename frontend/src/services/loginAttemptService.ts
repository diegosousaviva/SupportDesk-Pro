const STORAGE_KEY =
  "supportdesk-pro-login-attempts";

const MAX_FAILED_ATTEMPTS =
  5;

const BLOCK_DURATION_MILLISECONDS =
  5 * 60 * 1000;

interface LoginAttemptEntry {
  email: string;

  failedAttempts: number;

  blockedUntil: string | null;
}

function normalizeEmail(
  email: string
): string {
  return email
    .trim()
    .toLowerCase();
}

function loadEntries():
  LoginAttemptEntry[] {
  try {
    const storedData =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!storedData) {
      return [];
    }

    const parsedData =
      JSON.parse(
        storedData
      ) as unknown;

    if (
      !Array.isArray(
        parsedData
      )
    ) {
      return [];
    }

    return parsedData.filter(
      (
        entry
      ): entry is LoginAttemptEntry =>
        typeof entry ===
          "object" &&
        entry !==
          null &&
        typeof entry.email ===
          "string" &&
        typeof entry.failedAttempts ===
          "number" &&
        (
          entry.blockedUntil ===
            null ||
          typeof entry.blockedUntil ===
            "string"
        )
    );
  } catch {
    return [];
  }
}

function saveEntries(
  entries:
    LoginAttemptEntry[]
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      entries
    )
  );
}

function getEntry(
  email: string
):
  | LoginAttemptEntry
  | undefined {
  const normalizedEmail =
    normalizeEmail(
      email
    );

  return loadEntries().find(
    (entry) =>
      entry.email ===
      normalizedEmail
  );
}

function cleanupExpiredBlock(
  entry:
    LoginAttemptEntry
): LoginAttemptEntry {
  if (
    !entry.blockedUntil
  ) {
    return entry;
  }

  const blockedUntilDate =
    new Date(
      entry.blockedUntil
    );

  if (
    Number.isNaN(
      blockedUntilDate.getTime()
    )
  ) {
    return {
      ...entry,
      failedAttempts:
        0,
      blockedUntil:
        null,
    };
  }

  if (
    blockedUntilDate.getTime() <=
    Date.now()
  ) {
    return {
      ...entry,
      failedAttempts:
        0,
      blockedUntil:
        null,
    };
  }

  return entry;
}

export function getRemainingBlockMilliseconds(
  email: string
): number {
  const entry =
    getEntry(
      email
    );

  if (
    !entry ||
    !entry.blockedUntil
  ) {
    return 0;
  }

  const cleanedEntry =
    cleanupExpiredBlock(
      entry
    );

  if (
    !cleanedEntry.blockedUntil
  ) {
    resetLoginAttempts(
      email
    );

    return 0;
  }

  return Math.max(
    0,
    new Date(
      cleanedEntry.blockedUntil
    ).getTime() -
      Date.now()
  );
}

export function isLoginBlocked(
  email: string
): boolean {
  return (
    getRemainingBlockMilliseconds(
      email
    ) >
    0
  );
}

export function registerFailedLoginAttempt(
  email: string
): void {
  const normalizedEmail =
    normalizeEmail(
      email
    );

  const entries =
    loadEntries();

  const index =
    entries.findIndex(
      (entry) =>
        entry.email ===
        normalizedEmail
    );

  const currentEntry =
    index ===
    -1
      ? {
          email:
            normalizedEmail,

          failedAttempts:
            0,

          blockedUntil:
            null,
        }
      : cleanupExpiredBlock(
          entries[index]
        );

  const failedAttempts =
    currentEntry.failedAttempts +
    1;

  const blockedUntil =
    failedAttempts >=
    MAX_FAILED_ATTEMPTS
      ? new Date(
          Date.now() +
            BLOCK_DURATION_MILLISECONDS
        ).toISOString()
      : null;

  const updatedEntry:
    LoginAttemptEntry = {
      email:
        normalizedEmail,

      failedAttempts,

      blockedUntil,
    };

  if (
    index ===
    -1
  ) {
    entries.push(
      updatedEntry
    );
  } else {
    entries[index] =
      updatedEntry;
  }

  saveEntries(
    entries
  );
}

export function resetLoginAttempts(
  email: string
): void {
  const normalizedEmail =
    normalizeEmail(
      email
    );

  const entries =
    loadEntries().filter(
      (entry) =>
        entry.email !==
        normalizedEmail
    );

  saveEntries(
    entries
  );
}

export function getFailedLoginAttempts(
  email: string
): number {
  const entry =
    getEntry(
      email
    );

  if (!entry) {
    return 0;
  }

  const cleanedEntry =
    cleanupExpiredBlock(
      entry
    );

  return cleanedEntry.failedAttempts;
}

export function formatLoginBlockTime(
  milliseconds: number
): string {
  const totalSeconds =
    Math.ceil(
      milliseconds /
        1000
    );

  const minutes =
    Math.floor(
      totalSeconds /
        60
    );

  const seconds =
    totalSeconds %
    60;

  if (
    minutes <=
    0
  ) {
    return `${seconds}s`;
  }

  if (
    seconds ===
    0
  ) {
    return `${minutes}min`;
  }

  return `${minutes}min ${seconds}s`;
}