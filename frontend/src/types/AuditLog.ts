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

  /*
   * Usuário responsável pela ação.
   *
   * null é permitido para eventos em que
   * não existe um usuário autenticado.
   */
  userId: number | null;

  /*
   * Nome do usuário no momento em que
   * a ação foi registrada.
   *
   * Mantemos também o nome para preservar
   * o histórico mesmo se o usuário for
   * alterado futuramente.
   */
  userName: string;

  /*
   * ID do registro afetado.
   *
   * Exemplo:
   * chamado #1024, equipamento #15 etc.
   */
  entityId: number | null;

  /*
   * Descrição curta do evento.
   */
  description: string;

  /*
   * Informações adicionais opcionais.
   *
   * Poderemos utilizar este campo para
   * registrar valores anteriores/novos
   * sem precisar modificar a estrutura
   * principal da auditoria.
   */
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