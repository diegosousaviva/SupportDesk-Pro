import {
  createNoteRepository,
  deleteNoteById,
  findAllNotes,
  findNoteById,
  findNotesByAuthorUserId,
  updateNoteById,
} from "../repositories/noteRepository";

import {
  removeAllNoteAttachments,
} from "./noteAttachmentService";

import {
  getUserById,
} from "./userService";

import type {
  CreateNoteData,
  Note,
  NoteCategory,
  UpdateNoteData,
} from "../types/Note";

interface NoteAccessUser {
  id: number;
  role: string;
}

function isAdministrator(
  user: NoteAccessUser
): boolean {
  return (
    user.role === "Administrador"
  );
}

function validateUser(
  user:
    | NoteAccessUser
    | null
    | undefined
): asserts user is NoteAccessUser {
  if (!user) {
    throw new Error(
      "Usuário não autenticado."
    );
  }

  if (
    !Number.isInteger(
      user.id
    ) ||
    user.id <= 0
  ) {
    throw new Error(
      "Usuário inválido."
    );
  }
}

function validateNoteCategory(
  category: NoteCategory
): void {
  const validCategories:
    NoteCategory[] = [
      "Geral",
      "Procedimento",
      "Documentação",
      "Inventário",
      "Chamado",
      "Loja",
      "Outro",
    ];

  if (
    !validCategories.includes(
      category
    )
  ) {
    throw new Error(
      "Categoria da nota inválida."
    );
  }
}

function validateTitle(
  title: string
): string {
  const normalizedTitle =
    title.trim();

  if (!normalizedTitle) {
    throw new Error(
      "Informe o título da nota."
    );
  }

  if (
    normalizedTitle.length >
    150
  ) {
    throw new Error(
      "O título da nota deve possuir no máximo 150 caracteres."
    );
  }

  return normalizedTitle;
}

function validateDescription(
  description: string
): string {
  const normalizedDescription =
    description.trim();

  if (!normalizedDescription) {
    throw new Error(
      "Informe a descrição da nota."
    );
  }

  if (
    normalizedDescription.length >
    10000
  ) {
    throw new Error(
      "A descrição da nota deve possuir no máximo 10.000 caracteres."
    );
  }

  return normalizedDescription;
}

function canManageNote(
  note: Note,
  user: NoteAccessUser
): boolean {
  return (
    isAdministrator(user) ||
    note.authorUserId ===
      user.id
  );
}

export function getNotesForUser(
  user:
    | NoteAccessUser
    | null
    | undefined
): Note[] {
  validateUser(user);

  const notes =
    isAdministrator(user)
      ? findAllNotes()
      : findNotesByAuthorUserId(
          user.id
        );

  return [
    ...notes,
  ].sort(
    (
      firstNote,
      secondNote
    ) =>
      new Date(
        secondNote.updatedAt
      ).getTime() -
      new Date(
        firstNote.updatedAt
      ).getTime()
  );
}

export function getNoteByIdForUser(
  noteId: number,
  user:
    | NoteAccessUser
    | null
    | undefined
): Note | undefined {
  validateUser(user);

  if (
    !Number.isInteger(
      noteId
    ) ||
    noteId <= 0
  ) {
    return undefined;
  }

  const note =
    findNoteById(
      noteId
    );

  if (!note) {
    return undefined;
  }

  if (
    !canManageNote(
      note,
      user
    )
  ) {
    return undefined;
  }

  return note;
}

export function createNote(
  noteData: Omit<
    CreateNoteData,
    "authorUserId"
  >,
  user:
    | NoteAccessUser
    | null
    | undefined
): Note {
  validateUser(user);

  const registeredUser =
    getUserById(
      user.id
    );

  if (!registeredUser) {
    throw new Error(
      "O usuário responsável pela nota não foi encontrado."
    );
  }

  const title =
    validateTitle(
      noteData.title
    );

  const description =
    validateDescription(
      noteData.description
    );

  validateNoteCategory(
    noteData.category
  );

  return createNoteRepository({
    title,

    description,

    category:
      noteData.category,

    authorUserId:
      user.id,
  });
}

export function updateNote(
  noteId: number,
  updatedData:
    UpdateNoteData,
  user:
    | NoteAccessUser
    | null
    | undefined
): Note {
  validateUser(user);

  const note =
    findNoteById(
      noteId
    );

  if (!note) {
    throw new Error(
      "Nota não encontrada."
    );
  }

  if (
    !canManageNote(
      note,
      user
    )
  ) {
    throw new Error(
      "Você não possui permissão para editar esta nota."
    );
  }

  const normalizedData:
    UpdateNoteData = {};

  if (
    updatedData.title !==
    undefined
  ) {
    normalizedData.title =
      validateTitle(
        updatedData.title
      );
  }

  if (
    updatedData.description !==
    undefined
  ) {
    normalizedData.description =
      validateDescription(
        updatedData.description
      );
  }

  if (
    updatedData.category !==
    undefined
  ) {
    validateNoteCategory(
      updatedData.category
    );

    normalizedData.category =
      updatedData.category;
  }

  const updatedNote =
    updateNoteById(
      noteId,
      normalizedData
    );

  if (!updatedNote) {
    throw new Error(
      "Não foi possível atualizar a nota."
    );
  }

  return updatedNote;
}

export async function deleteNote(
  noteId: number,
  user:
    | NoteAccessUser
    | null
    | undefined
): Promise<boolean> {
  validateUser(user);

  if (
    !Number.isInteger(
      noteId
    ) ||
    noteId <= 0
  ) {
    return false;
  }

  const note =
    findNoteById(
      noteId
    );

  if (!note) {
    return false;
  }

  if (
    !canManageNote(
      note,
      user
    )
  ) {
    throw new Error(
      "Você não possui permissão para excluir esta nota."
    );
  }

  /*
   * Os anexos precisam ser excluídos primeiro.
   *
   * O serviço de anexos valida se a nota ainda existe,
   * portanto não podemos excluir o registro da nota antes.
   *
   * Além disso, se houver algum problema no IndexedDB,
   * a nota permanecerá cadastrada e evitamos deixar
   * arquivos órfãos no navegador.
   */
  await removeAllNoteAttachments(
    noteId,
    user
  );

  const deleted =
    deleteNoteById(
      noteId
    );

  if (!deleted) {
    throw new Error(
      "Não foi possível excluir a nota."
    );
  }

  return true;
}

export function canUserManageNote(
  note: Note,
  user:
    | NoteAccessUser
    | null
    | undefined
): boolean {
  if (!user) {
    return false;
  }

  return canManageNote(
    note,
    user
  );
}