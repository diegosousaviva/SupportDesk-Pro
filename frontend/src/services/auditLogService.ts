import type {
  AuditLog,
  CreateAuditLogData,
} from "../types/AuditLog";

const STORAGE_KEY =
  "supportdesk-pro-audit-log";

function saveAuditLogs(
  logs: AuditLog[]
): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        logs
      )
    );
  } catch (error) {
    console.error(
      "Não foi possível salvar os registros de auditoria.",
      error
    );
  }
}

function loadAuditLogs():
  AuditLog[] {
  try {
    const storedLogs =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!storedLogs) {
      return [];
    }

    const parsedLogs:
      unknown =
      JSON.parse(
        storedLogs
      );

    if (
      !Array.isArray(
        parsedLogs
      )
    ) {
      return [];
    }

    return parsedLogs.filter(
      (
        log
      ): log is AuditLog =>
        typeof log ===
          "object" &&
        log !== null &&
        typeof log.id ===
          "number" &&
        typeof log.module ===
          "string" &&
        typeof log.action ===
          "string" &&
        (
          log.userId ===
            null ||
          typeof log.userId ===
            "number"
        ) &&
        typeof log.userName ===
          "string" &&
        (
          log.entityId ===
            null ||
          typeof log.entityId ===
            "number"
        ) &&
        typeof log.description ===
          "string" &&
        typeof log.createdAt ===
          "string"
    );
  } catch (error) {
    console.error(
      "Não foi possível carregar os registros de auditoria.",
      error
    );

    return [];
  }
}

function normalizeText(
  value: string
): string {
  return value.trim();
}

function sortAuditLogs(
  logs:
    AuditLog[]
): AuditLog[] {
  return [
    ...logs,
  ].sort(
    (
      firstLog,
      secondLog
    ) => {
      const firstDate =
        new Date(
          firstLog.createdAt
        ).getTime();

      const secondDate =
        new Date(
          secondLog.createdAt
        ).getTime();

      if (
        Number.isNaN(
          firstDate
        ) ||
        Number.isNaN(
          secondDate
        )
      ) {
        return (
          secondLog.id -
          firstLog.id
        );
      }

      return (
        secondDate -
        firstDate
      );
    }
  );
}

export function getAuditLogs():
  AuditLog[] {
  return sortAuditLogs(
    loadAuditLogs()
  );
}

export function getAuditLogById(
  logId: number
): AuditLog | undefined {
  if (
    !Number.isInteger(
      logId
    ) ||
    logId <= 0
  ) {
    return undefined;
  }

  return loadAuditLogs().find(
    (log) =>
      log.id ===
      logId
  );
}

export function createAuditLog(
  data:
    CreateAuditLogData
): AuditLog {
  const logs =
    loadAuditLogs();

  const description =
    normalizeText(
      data.description
    );

  const userName =
    normalizeText(
      data.userName
    ) ||
    "Sistema";

  const details =
    data.details ===
    undefined
      ? undefined
      : normalizeText(
          data.details
        );

  if (!description) {
    throw new Error(
      "Informe a descrição do evento de auditoria."
    );
  }

  const highestId =
    logs.reduce(
      (
        currentHighestId,
        log
      ) =>
        Math.max(
          currentHighestId,
          log.id
        ),
      0
    );

  const newLog:
    AuditLog = {
      id:
        highestId +
        1,

      module:
        data.module,

      action:
        data.action,

      userId:
        data.userId,

      userName,

      entityId:
        data.entityId ??
        null,

      description,

      createdAt:
        new Date().toISOString(),
    };

  if (details) {
    newLog.details =
      details;
  }

  saveAuditLogs([
    ...logs,
    newLog,
  ]);

  return newLog;
}

export function clearAuditLogs():
  void {
  saveAuditLogs(
    []
  );
}