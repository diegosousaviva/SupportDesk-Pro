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

  storeId?: number | null;

  amount?: number | null;

  noteDate?: string;

  authorUserId: number;

  createdAt: string;

  updatedAt: string;
}

export interface CreateNoteData {
  title: string;

  description: string;

  category: NoteCategory;

  storeId?: number | null;

  amount?: number | null;

  noteDate?: string;

  authorUserId: number;
}

export interface UpdateNoteData {
  title?: string;

  description?: string;

  category?: NoteCategory;

  storeId?: number | null;

  amount?: number | null;

  noteDate?: string;
}
