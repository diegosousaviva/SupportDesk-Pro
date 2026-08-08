export type NoteCategory =
  | "Geral"
  | "Procedimento"
  | "Documentação"
  | "Inventário"
  | "Chamado"
  | "Loja"
  | "Outro";

export interface Note {
  id: number;

  title: string;

  description: string;

  category: NoteCategory;

  authorUserId: number;

  createdAt: string;

  updatedAt: string;
}

export interface CreateNoteData {
  title: string;

  description: string;

  category: NoteCategory;

  authorUserId: number;
}

export interface UpdateNoteData {
  title?: string;

  description?: string;

  category?: NoteCategory;
}