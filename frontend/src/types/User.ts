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

  /**
   * Loja à qual o usuário está vinculado.
   *
   * - Solicitante: deverá possuir uma loja.
   * - Técnico: null/undefined significa atuação em todas as lojas.
   * - Administrador: null/undefined significa acesso a todas as lojas.
   *
   * O campo é opcional temporariamente para permitir
   * a migração dos usuários antigos que já existem
   * no armazenamento local.
   */
  storeId?: number | null;

  status: UserStatus;

  createdAt: string;
}