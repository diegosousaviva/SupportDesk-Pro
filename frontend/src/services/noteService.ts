import {
  createNoteRepository,
  deleteNoteById,
  findAllNotes,
  findNoteById,
  findNotesByAuthorUserId,
  updateNoteById,
} from "../repositories/noteRepository";

import {
  createAuditLog,
} from "./auditLogService";

import {
  removeAllNoteAttachments,
} from "./noteAttachmentService";

import {
  getUserById,
} from "./userService";
import { getStoreById } from "./storeService";

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

const MINIMUM_TITLE_LENGTH =
  3;

const MAXIMUM_TITLE_LENGTH =
  150;

const MINIMUM_DESCRIPTION_LENGTH =
  10;

const MAXIMUM_DESCRIPTION_LENGTH =
  10000;

const VALID_CATEGORIES:
  readonly NoteCategory[] = [
    "Geral",
    "Procedimento",
    "Documentação",
    "Inventário",
    "Chamado",
    "Loja",
    "Outro",
  ];

function isValidNoteDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function isAdministrator(
  user: NoteAccessUser
): boolean {
  return (
    user.role ===
    "Administrador"
  );
}

function isValidNoteId(
  noteId: number
): boolean {
  return (
    Number.isInteger(
      noteId
    ) &&
    noteId > 0
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

function validateRegisteredUser(
  user:
    NoteAccessUser
): void {
  const registeredUser =
    getUserById(
      user.id
    );

  if (!registeredUser) {
    throw new Error(
      "O usuário responsável pela operação não foi encontrado."
    );
  }

  if (
    registeredUser.status !==
    "Ativo"
  ) {
    throw new Error(
      "O usuário responsável pela operação está inativo."
    );
  }
}

function validateNoteCategory(
  category:
    NoteCategory
): void {
  if (
    !VALID_CATEGORIES.includes(
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

  if (
    !normalizedTitle
  ) {
    throw new Error(
      "Informe o título da nota."
    );
  }

  if (
    normalizedTitle.length <
    MINIMUM_TITLE_LENGTH
  ) {
    throw new Error(
      `O título da nota deve possuir pelo menos ${MINIMUM_TITLE_LENGTH} caracteres.`
    );
  }

  if (
    normalizedTitle.length >
    MAXIMUM_TITLE_LENGTH
  ) {
    throw new Error(
      `O título da nota deve possuir no máximo ${MAXIMUM_TITLE_LENGTH} caracteres.`
    );
  }

  return normalizedTitle;
}

function validateDescription(
  description: string
): string {
  const normalizedDescription =
    description.trim();

  if (
    !normalizedDescription
  ) {
    throw new Error(
      "Informe a descrição da nota."
    );
  }

  if (
    normalizedDescription.length <
    MINIMUM_DESCRIPTION_LENGTH
  ) {
    throw new Error(
      `A descrição da nota deve possuir pelo menos ${MINIMUM_DESCRIPTION_LENGTH} caracteres.`
    );
  }

  if (
    normalizedDescription.length >
    MAXIMUM_DESCRIPTION_LENGTH
  ) {
    throw new Error(
      `A descrição da nota deve possuir no máximo ${MAXIMUM_DESCRIPTION_LENGTH.toLocaleString(
        "pt-BR"
      )} caracteres.`
    );
  }

  return normalizedDescription;
}

function canManageNote(
  note: Note,
  user: NoteAccessUser
): boolean {
  return (
    isAdministrator(
      user
    ) ||
    note.authorUserId ===
      user.id
  );
}

function getAuditUserName(
  user:
    NoteAccessUser
): string {
  const registeredUser =
    getUserById(
      user.id
    );

  return (
    registeredUser?.name ??
    `Usuário #${user.id}`
  );
}

function getNoteAuthorName(
  note: Note
): string {
  const author =
    getUserById(
      note.authorUserId
    );

  return (
    author?.name ??
    `Usuário #${note.authorUserId}`
  );
}

function registerNoteAudit(
  noteId: number,
  user: NoteAccessUser,
  action:
    | "Criação"
    | "Edição"
    | "Exclusão",
  description: string,
  details?: string
): void {
  createAuditLog({
    module:
      "Notas",

    action,

    userId:
      user.id,

    userName:
      getAuditUserName(
        user
      ),

    entityId:
      noteId,

    description,

    details,
  });
}

export function getNotesForUser(
  user:
    | NoteAccessUser
    | null
    | undefined
): Note[] {
  validateUser(
    user
  );

  const notes =
    isAdministrator(
      user
    )
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
  validateUser(
    user
  );

  if (
    !isValidNoteId(
      noteId
    )
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

export async function createNote(
  noteData: Omit<
    CreateNoteData,
    "authorUserId"
  >,
  user:
    | NoteAccessUser
    | null
    | undefined
): Promise<Note> {
  validateUser(
    user
  );

  validateRegisteredUser(
    user
  );

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

  if (noteData.storeId !== undefined && noteData.storeId !== null && (!Number.isSafeInteger(noteData.storeId) || noteData.storeId < 1)) {
    throw new Error("Selecione uma loja válida.");
  }
  if (noteData.amount !== undefined && noteData.amount !== null && (!Number.isFinite(noteData.amount) || noteData.amount < 0 || Math.round(noteData.amount * 100) !== noteData.amount * 100)) {
    throw new Error("Informe um valor válido com até duas casas decimais.");
  }
  if (noteData.noteDate !== undefined && !isValidNoteDate(noteData.noteDate)) {
    throw new Error("Informe uma data válida para a nota.");
  }

  const createdNote =
    await createNoteRepository({
      title,

      description,

      category:
        noteData.category,

      storeId: noteData.storeId ?? null,

      amount: noteData.amount ?? null,

      noteDate: noteData.noteDate,

      authorUserId:
        user.id,
    });

  registerNoteAudit(
    createdNote.id,
    user,
    "Criação",
    `Nota "${createdNote.title}" criada.`,
    `Categoria: ${createdNote.category} | Autor: ${registeredUser.name}`
  );

  return createdNote;
}

export async function updateNote(
  noteId: number,
  updatedData:
    UpdateNoteData,
  user:
    | NoteAccessUser
    | null
    | undefined
): Promise<Note> {
  validateUser(
    user
  );

  if (
    !isValidNoteId(
      noteId
    )
  ) {
    throw new Error(
      "Nota inválida."
    );
  }

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

  if (updatedData.storeId !== undefined) {
    if (updatedData.storeId !== null && (!Number.isSafeInteger(updatedData.storeId) || updatedData.storeId < 1)) throw new Error("Selecione uma loja válida.");
    normalizedData.storeId = updatedData.storeId;
  }

  if (updatedData.amount !== undefined) {
    if (updatedData.amount !== null && (!Number.isFinite(updatedData.amount) || updatedData.amount < 0 || Math.round(updatedData.amount * 100) !== updatedData.amount * 100)) throw new Error("Informe um valor válido com até duas casas decimais.");
    normalizedData.amount = updatedData.amount;
  }

  if (updatedData.noteDate !== undefined) {
    if (!isValidNoteDate(updatedData.noteDate)) throw new Error("Informe uma data válida para a nota.");
    normalizedData.noteDate = updatedData.noteDate;
  }

  const updatedNote =
    await updateNoteById(
      noteId,
      normalizedData
    );

  if (!updatedNote) {
    throw new Error(
      "Não foi possível atualizar a nota."
    );
  }

  const changedFields:
    string[] = [];

  if (
    note.title !==
    updatedNote.title
  ) {
    changedFields.push(
      `Título: "${note.title}" → "${updatedNote.title}"`
    );
  }

  if (
    note.category !==
    updatedNote.category
  ) {
    changedFields.push(
      `Categoria: "${note.category}" → "${updatedNote.category}"`
    );
  }

  if (
    note.description !==
    updatedNote.description
  ) {
    changedFields.push(
      "Descrição alterada"
    );
  }

  if (note.storeId !== updatedNote.storeId) {
    const previousStore = note.storeId == null ? "Sem loja" : getStoreById(note.storeId)?.name ?? `Loja #${note.storeId}`;
    const nextStore = updatedNote.storeId == null ? "Sem loja" : getStoreById(updatedNote.storeId)?.name ?? `Loja #${updatedNote.storeId}`;
    changedFields.push(`Loja: ${previousStore} → ${nextStore}`);
  }

  if (note.amount !== updatedNote.amount) {
    const formatAmount = (value: number | null | undefined) => value == null ? "Sem valor" : value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    changedFields.push(`Valor: ${formatAmount(note.amount)} → ${formatAmount(updatedNote.amount)}`);
  }

  if (note.noteDate !== updatedNote.noteDate) {
    changedFields.push(`Data da nota: ${note.noteDate ?? "Não informada"} → ${updatedNote.noteDate ?? "Não informada"}`);
  }

  if (
    changedFields.length >
    0
  ) {
    const authorName =
      getNoteAuthorName(
        note
      );

    registerNoteAudit(
      updatedNote.id,
      user,
      "Edição",
      `Nota "${updatedNote.title}" editada.`,
      [
        ...changedFields,

        `Autor: ${authorName}`,
      ].join(
        " | "
      )
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
  validateUser(
    user
  );

  if (
    !isValidNoteId(
      noteId
    )
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
    await deleteNoteById(
      noteId
    );

  if (!deleted) {
    throw new Error(
      "Não foi possível excluir a nota."
    );
  }

  registerNoteAudit(
    note.id,
    user,
    "Exclusão",
    `Nota "${note.title}" excluída.`,
    `Categoria: ${note.category} | Autor: ${getNoteAuthorName(
      note
    )}`
  );

  return true;
}

export function canUserManageNote(
  note: Note,
  user:
    | NoteAccessUser
    | null
    | undefined
): boolean {
  if (
    !user ||
    !Number.isInteger(
      user.id
    ) ||
    user.id <= 0
  ) {
    return false;
  }

  return canManageNote(
    note,
    user
  );
}
