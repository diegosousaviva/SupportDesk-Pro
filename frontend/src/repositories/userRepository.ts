import type { User } from "../types/User";
import { getAuthToken } from "../services/sessionService";
import { API_BASE_URL as API_URL } from "../services/apiBaseUrl";

let users: User[] = [];

export function replaceUserCache(records: Array<Omit<User, "password"> | User>): void {
  users = records.map((record) => ({ ...record, password: "" } as User));
}
export function upsertUserCache(record: Omit<User, "password"> | User): User {
  const user = { ...record, password: "" } as User;
  users = [...users.filter((entry) => entry.id !== user.id), user];
  return user;
}
export function removeUserFromCache(id: number): void { users = users.filter((user) => user.id !== id); }

export async function refreshUsers(currentUser?: Omit<User, "password">): Promise<User[]> {
  const token = getAuthToken();
  if (!token) { replaceUserCache(currentUser ? [currentUser] : []); return findAllUsers(); }
  if (currentUser?.role !== "Administrador") { replaceUserCache(currentUser ? [currentUser] : []); return findAllUsers(); }
  const response = await fetch(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
  const result = await response.json() as { success?: boolean; message?: string; users?: Array<Omit<User, "password">> };
  if (!response.ok || !result.success) throw new Error(result.message || "Não foi possível carregar os usuários.");
  replaceUserCache(result.users ?? []);
  return findAllUsers();
}

export function findAllUsers(): User[] { return [...users]; }
export function findUserById(id: number): User | undefined { return users.find((user) => user.id === id); }
export function findUserByEmail(email: string): User | undefined {
  const normalized = email.trim().toLowerCase();
  return users.find((user) => user.email.trim().toLowerCase() === normalized);
}
export function createUserRepository(data: Omit<User, "id"> & { id?: number }): User {
  const user = { ...data, id: data.id ?? Math.max(0, ...users.map((entry) => entry.id)) + 1 } as User;
  return upsertUserCache(user);
}
export function updateUserById(id: number, data: Partial<User>): User | undefined {
  const current = findUserById(id);
  return current ? upsertUserCache({ ...current, ...data, id }) : undefined;
}
export function deleteUserById(id: number): boolean {
  const exists = users.some((user) => user.id === id);
  removeUserFromCache(id);
  return exists;
}
