export type UserRole =
  | "Administrador"
  | "Técnico"
  | "Solicitante";

export type UserStatus =
  | "Ativo"
  | "Inativo";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  department: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}