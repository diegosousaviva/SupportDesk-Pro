import { getAuthToken } from "./sessionService";
import { API_BASE_URL as API_URL } from "./apiBaseUrl";

export type DataEntity =
  | "stores"
  | "tickets"
  | "ticket-attachments"
  | "ticket-comments"
  | "ticket-history"
  | "inventory"
  | "inventory-history"
  | "notes"
  | "note-attachments"
  | "user-history"
  | "settings"
  | "audit-logs"
  | "notifications"
  | "sla-notification-dismissals";

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  records?: T[];
  record?: T;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/data${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...init.headers,
      },
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
  }
  let result: ApiEnvelope<T>;
  try {
    result = await response.json() as ApiEnvelope<T>;
  } catch {
    throw new Error("O servidor retornou uma resposta inválida.");
  }
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Não foi possível concluir a operação.");
  }
  return result as T;
}

export async function listData<T>(entity: DataEntity): Promise<T[]> {
  const result = await request<ApiEnvelope<T>>(`/${entity}`);
  return result.records ?? [];
}

export async function getTicketAlerts(afterId: number): Promise<{ latestId: number; count: number }> {
  const result = await request<ApiEnvelope<{ latestId: number; count: number }>>(`/ticket-alerts?afterId=${afterId}`);
  if (!result.record) throw new Error("O servidor não retornou os alertas.");
  return result.record;
}

export async function streamTicketAlerts(
  afterId: number,
  signal: AbortSignal,
  onAlert: (summary: { latestId: number; count: number }) => void,
): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");
  const response = await fetch(`${API_URL}/api/data/ticket-alerts/stream?afterId=${afterId}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  if (!response.ok || !response.body) throw new Error("Não foi possível conectar aos alertas.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      pending += decoder.decode(value, { stream: true });
      const lines = pending.split("\n");
      pending = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        const summary = JSON.parse(line) as { latestId: number; count: number };
        if (!Number.isSafeInteger(summary.latestId) || summary.latestId < 0 ||
            !Number.isSafeInteger(summary.count) || summary.count < 0) {
          throw new Error("O servidor retornou um alerta inválido.");
        }
        if (!signal.aborted) onAlert(summary);
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export async function createData<T>(entity: DataEntity, data: unknown): Promise<T> {
  const result = await request<ApiEnvelope<T>>(`/${entity}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!result.record) throw new Error("O servidor não retornou o registro criado.");
  return result.record;
}

export async function updateData<T>(entity: DataEntity, id: number, data: unknown): Promise<T> {
  const result = await request<ApiEnvelope<T>>(`/${entity}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!result.record) throw new Error("O servidor não retornou o registro atualizado.");
  return result.record;
}

export async function getData<T>(entity: DataEntity, id: number): Promise<T> {
  const result = await request<ApiEnvelope<T>>(`/${entity}/${id}`);
  if (!result.record) throw new Error("O registro não foi encontrado.");
  return result.record;
}

export async function deleteData(entity: DataEntity, id: number): Promise<void> {
  await request<ApiEnvelope<never>>(`/${entity}/${id}`, { method: "DELETE" });
}

export async function saveSharedSettings<T>(data: unknown): Promise<T> {
  const result = await request<ApiEnvelope<T>>("/settings", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!result.record) throw new Error("O servidor não retornou as configurações salvas.");
  return result.record;
}
