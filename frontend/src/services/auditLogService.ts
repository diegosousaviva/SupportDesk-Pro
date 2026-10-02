import { createData, listData } from "./dataApi";
import { getAuthToken } from "./sessionService";
import type { AuditLog, CreateAuditLogData } from "../types/AuditLog";

let auditLogCache: AuditLog[] = [];

function sortAuditLogs(logs: AuditLog[]): AuditLog[] {
  return [...logs].sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt));
}

export async function refreshAuditLogs(): Promise<AuditLog[]> {
  auditLogCache = sortAuditLogs(await listData<AuditLog>("audit-logs"));
  return [...auditLogCache];
}

export function getAuditLogs(): AuditLog[] {
  return sortAuditLogs(auditLogCache);
}

export function getAuditLogById(logId: number): AuditLog | undefined {
  if (!Number.isSafeInteger(logId) || logId < 1) return undefined;
  return auditLogCache.find((log) => log.id === logId);
}

export function createAuditLog(data: CreateAuditLogData): void {
  // Authentication failures occur before a session exists and remain handled by server login throttling.
  if (!getAuthToken()) return;
  const description = data.description.trim();
  if (!description) return;
  const payload = {
    module: data.module,
    action: data.action,
    entityId: data.entityId ?? null,
    description,
    ...(data.details?.trim() ? { details: data.details.trim() } : {}),
  };
  void createData<AuditLog>("audit-logs", payload)
    .then((created) => { auditLogCache = sortAuditLogs([created, ...auditLogCache]); })
    .catch((error: unknown) => console.error("Não foi possível registrar a auditoria no servidor.", error));
}
