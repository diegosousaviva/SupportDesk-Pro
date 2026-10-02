import { getAuthToken } from "./sessionService";
import type { Category, CreateCategoryData, UpdateCategoryData } from "../types/Category";
import { API_BASE_URL as API_URL } from "./apiBaseUrl";

interface CategoryEnvelope {
  success: boolean;
  message?: string;
  categories?: Category[];
  category?: Category;
}

async function request(path: string, init: RequestInit = {}): Promise<CategoryEnvelope> {
  const token = getAuthToken();
  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/categories${path}`, {
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

  let result: CategoryEnvelope;
  try {
    result = await response.json() as CategoryEnvelope;
  } catch {
    throw new Error("O servidor retornou uma resposta inválida.");
  }
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Não foi possível concluir a operação de categoria.");
  }
  return result;
}

export async function listCategoriesApi(): Promise<Category[]> {
  const result = await request("");
  return result.categories ?? [];
}

export async function getCategoryApi(id: number): Promise<Category | undefined> {
  try {
    const result = await request(`/${id}`);
    return result.category;
  } catch (error) {
    if (error instanceof Error && error.message === "Categoria não encontrada.") return undefined;
    throw error;
  }
}

export async function createCategoryApi(data: CreateCategoryData): Promise<Category> {
  const result = await request("", { method: "POST", body: JSON.stringify(data) });
  if (!result.category) throw new Error("O servidor não retornou a categoria criada.");
  return result.category;
}

export async function updateCategoryApi(id: number, data: UpdateCategoryData): Promise<Category | undefined> {
  const result = await request(`/${id}`, { method: "PUT", body: JSON.stringify(data) });
  return result.category;
}

export async function deleteCategoryApi(id: number): Promise<void> {
  await request(`/${id}`, { method: "DELETE" });
}
