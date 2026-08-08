import {
  createNoteAttachmentRepository,
  deleteNoteAttachmentById,
  deleteNoteAttachmentsByNoteId,
  findNoteAttachmentById,
  findNoteAttachmentsByNoteId,
} from "../repositories/noteAttachmentRepository";

import {
  findNoteById,
} from "../repositories/noteRepository";

import type {
  NoteAttachment,
  StoredNoteAttachment,
} from "../types/NoteAttachment";

interface NoteAttachmentAccessUser {
  id: number;
  role: string;
}

const MAX_FILE_SIZE =
  20 * 1024 * 1024;

const ALLOWED_FILE_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "csv",
  "txt",
  "jpg",
  "jpeg",
  "png",
  "webp",
] as const;

function isAdministrator(
  user: NoteAttachmentAccessUser
): boolean {
  return (
    user.role === "Administrador"
  );
}

function validateUser(
  user:
    | NoteAttachmentAccessUser
    | null
    | undefined
): asserts user is NoteAttachmentAccessUser {
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

function validateNoteAccess(
  noteId: number,
  user: NoteAttachmentAccessUser
): void {
  if (
    !Number.isInteger(
      noteId
    ) ||
    noteId <= 0
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
    !isAdministrator(user) &&
    note.authorUserId !==
      user.id
  ) {
    throw new Error(
      "Você não possui permissão para acessar os anexos desta nota."
    );
  }
}

function getFileExtension(
  fileName: string
): string {
  const lastDotIndex =
    fileName.lastIndexOf(".");

  if (
    lastDotIndex === -1 ||
    lastDotIndex ===
      fileName.length - 1
  ) {
    return "";
  }

  return fileName
    .slice(
      lastDotIndex + 1
    )
    .toLowerCase();
}

function validateFile(
  file: File
): void {
  if (
    !file ||
    !(file instanceof File)
  ) {
    throw new Error(
      "Arquivo inválido."
    );
  }

  if (
    !file.name.trim()
  ) {
    throw new Error(
      "O arquivo deve possuir um nome."
    );
  }

  if (
    file.size <= 0
  ) {
    throw new Error(
      "O arquivo selecionado está vazio."
    );
  }

  if (
    file.size >
    MAX_FILE_SIZE
  ) {
    throw new Error(
      "O arquivo deve possuir no máximo 20 MB."
    );
  }

  const extension =
    getFileExtension(
      file.name
    );

  const extensionAllowed =
    ALLOWED_FILE_EXTENSIONS.some(
      (
        allowedExtension
      ) =>
        allowedExtension ===
        extension
    );

  if (
    !extensionAllowed
  ) {
    throw new Error(
      "Tipo de arquivo não permitido. Utilize PDF, Word, Excel, CSV, TXT ou imagens JPG, PNG e WEBP."
    );
  }
}

async function validateAttachmentAccess(
  attachmentId: string,
  user: NoteAttachmentAccessUser
): Promise<StoredNoteAttachment> {
  if (
    !attachmentId.trim()
  ) {
    throw new Error(
      "Anexo inválido."
    );
  }

  const attachment =
    await findNoteAttachmentById(
      attachmentId
    );

  if (!attachment) {
    throw new Error(
      "Anexo não encontrado."
    );
  }

  validateNoteAccess(
    attachment.noteId,
    user
  );

  return attachment;
}

export async function addNoteAttachment(
  noteId: number,
  file: File,
  user:
    | NoteAttachmentAccessUser
    | null
    | undefined
): Promise<NoteAttachment> {
  validateUser(user);

  validateNoteAccess(
    noteId,
    user
  );

  validateFile(
    file
  );

  return createNoteAttachmentRepository({
    noteId,

    file,

    uploadedByUserId:
      user.id,
  });
}

export async function getNoteAttachments(
  noteId: number,
  user:
    | NoteAttachmentAccessUser
    | null
    | undefined
): Promise<NoteAttachment[]> {
  validateUser(user);

  validateNoteAccess(
    noteId,
    user
  );

  return findNoteAttachmentsByNoteId(
    noteId
  );
}

export async function getNoteAttachmentFile(
  attachmentId: string,
  user:
    | NoteAttachmentAccessUser
    | null
    | undefined
): Promise<StoredNoteAttachment> {
  validateUser(user);

  return validateAttachmentAccess(
    attachmentId,
    user
  );
}

export async function removeNoteAttachment(
  attachmentId: string,
  user:
    | NoteAttachmentAccessUser
    | null
    | undefined
): Promise<boolean> {
  validateUser(user);

  await validateAttachmentAccess(
    attachmentId,
    user
  );

  return deleteNoteAttachmentById(
    attachmentId
  );
}

export async function removeAllNoteAttachments(
  noteId: number,
  user:
    | NoteAttachmentAccessUser
    | null
    | undefined
): Promise<void> {
  validateUser(user);

  validateNoteAccess(
    noteId,
    user
  );

  await deleteNoteAttachmentsByNoteId(
    noteId
  );
}

export async function downloadNoteAttachment(
  attachmentId: string,
  user:
    | NoteAttachmentAccessUser
    | null
    | undefined
): Promise<void> {
  const attachment =
    await getNoteAttachmentFile(
      attachmentId,
      user
    );

  const objectUrl =
    URL.createObjectURL(
      attachment.file
    );

  const link =
    document.createElement(
      "a"
    );

  link.href =
    objectUrl;

  link.download =
    attachment.fileName;

  document.body.appendChild(
    link
  );

  link.click();

  document.body.removeChild(
    link
  );

  URL.revokeObjectURL(
    objectUrl
  );
}

export function getMaximumNoteAttachmentSize(): number {
  return MAX_FILE_SIZE;
}

export function getAllowedNoteAttachmentExtensions(): string[] {
  return [
    ...ALLOWED_FILE_EXTENSIONS,
  ];
}