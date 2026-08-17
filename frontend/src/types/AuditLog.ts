export type AuditModule =
  | "Autenticação"
  | "Chamados"
  | "Inventário"
  | "Usuários"
  | "Lojas"
  | "Notas"
  | "Categorias"
  | "Configurações";

export type AuditAction =
  | "Login"
  | "Logout"
  | "Falha de login"
  | "Bloqueio de login"
  | "Sessão expirada"
  | "Sessão invalidada"
  | "Criação"
  | "Edição"
  | "Exclusão"
  | "Alteração de status"
  | "Alteração de responsável"
  | "Vinculação"
  | "Desvinculação"
  | "Upload"
  | "Download"
  | "Impressão";

export interface AuditLog {
  id: number;

  module: AuditModule;

  action: AuditAction;

  userId: number | null;

  userName: string;

  entityId: number | null;

  description: string;

  details?: string;

  createdAt: string;
}

export interface CreateAuditLogData {
  module: AuditModule;

  action: AuditAction;

  userId: number | null;

  userName: string;

  entityId?: number | null;

  description: string;

  details?: string;
}