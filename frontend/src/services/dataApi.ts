import { getAuthToken } from "./sessionService";
import { API_BASE_URL as API_URL } from "./apiBaseUrl";

export type DataEntity =
  | "stores"
  | "tickets"
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
