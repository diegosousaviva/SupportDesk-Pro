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

  storeId?: number | null;

  status: UserStatus;

  createdAt: string;

  /**
   * Indica se o usuário precisa trocar a senha
   * antes de continuar utilizando o sistema.
   *
   * true  = troca obrigatória
   * false/undefined = senha normal
   */
  mustChangePassword?: boolean;
}

export type CreateUserData = Omit<
  User,
  "id"
>;

export type UpdateUserData =
  Partial<
    Omit<User, "id" | "createdAt">
  >;