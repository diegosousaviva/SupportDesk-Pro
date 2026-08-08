import type {
  CreateNoteData,
  Note,
  NoteCategory,
  UpdateNoteData,
} from "../types/Note";

const STORAGE_KEY =
  "supportdesk-pro-notes";

type StoredNote =
  Partial<Note> & {
    id?: unknown;
    title?: unknown;
    description?: unknown;
    category?: unknown;
    authorUserId?: unknown;
    createdAt?: unknown;
    updatedAt?: unknown;
  };

function isNoteCategory(
  value: unknown
): value is NoteCategory {
  return (
    value === "Geral" ||
    value === "Procedimento" ||
    value === "Documentação" ||
    value === "Inventário" ||
    value === "Chamado" ||
    value === "Loja" ||
    value === "Outro"
  );
}

function isValidDateString(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    !Number.isNaN(
      Date.parse(value)
    )
  );
}

function migrateStoredNote(
  storedNote: StoredNote
): Note | null {
  if (
    typeof storedNote.id !==
      "number" ||
    !Number.isInteger(
      storedNote.id
    ) ||
    storedNote.id <= 0 ||
    typeof storedNote.title !==
      "string" ||
    typeof storedNote.description !==
      "string" ||
    !isNoteCategory(
      storedNote.category
    ) ||
    typeof storedNote.authorUserId !==
      "number" ||
    !Number.isInteger(
      storedNote.authorUserId
    ) ||
    storedNote.authorUserId <= 0
  ) {
    return null;
  }

  const migrationDate =
    new Date().toISOString();

  const createdAt =
    isValidDateString(
      storedNote.createdAt
    )
      ? storedNote.createdAt
      : migrationDate;

  const updatedAt =
    isValidDateString(
      storedNote.updatedAt
    )
      ? storedNote.updatedAt
      : createdAt;

  return {
    id:
      storedNote.id,

    title:
      storedNote.title.trim(),

    description:
      storedNote.description.trim(),

    category:
      storedNote.category,

    authorUserId:
      storedNote.authorUserId,

    createdAt,

    updatedAt,
  };
}

function saveNotesToStorage(
  notesToSave: Note[]
): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        notesToSave
      )
    );
  } catch (error) {
    console.error(
      "Não foi possível salvar as notas no Local Storage.",
      error
    );
  }
}

function loadNotesFromStorage(): Note[] {
  try {
    const storedNotes =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!storedNotes) {
      return [];
    }

    const parsedData: unknown =
      JSON.parse(
        storedNotes
      );

    if (
      !Array.isArray(
        parsedData
      )
    ) {
      saveNotesToStorage([]);

      return [];
    }

    const migratedNotes =
      parsedData
        .map(
          (storedNote) =>
            migrateStoredNote(
              storedNote as StoredNote
            )
        )
        .filter(
          (
            note
          ): note is Note =>
            note !== null
        );

    saveNotesToStorage(
      migratedNotes
    );

    return migratedNotes;
  } catch (error) {
    console.error(
      "Não foi possível carregar as notas do Local Storage.",
      error
    );

    return [];
  }
}

let notes: Note[] =
  loadNotesFromStorage();

export function findAllNotes(): Note[] {
  return [...notes];
}

export function findNotesByAuthorUserId(
  authorUserId: number
): Note[] {
  return notes.filter(
    (note) =>
      note.authorUserId ===
      authorUserId
  );
}

export function findNoteById(
  id: number
): Note | undefined {
  return notes.find(
    (note) =>
      note.id === id
  );
}

export function createNoteRepository(
  noteData: CreateNoteData
): Note {
  const highestId =
    notes.reduce(
      (
        currentHighestId,
        note
      ) =>
        Math.max(
          currentHighestId,
          note.id
        ),
      0
    );

  const currentDate =
    new Date().toISOString();

  const newNote: Note = {
    id:
      highestId + 1,

    title:
      noteData.title.trim(),

    description:
      noteData.description.trim(),

    category:
      noteData.category,

    authorUserId:
      noteData.authorUserId,

    createdAt:
      currentDate,

    updatedAt:
      currentDate,
  };

  notes = [
    ...notes,
    newNote,
  ];

  saveNotesToStorage(
    notes
  );

  return newNote;
}

export function updateNoteById(
  id: number,
  updatedData: UpdateNoteData
): Note | undefined {
  const currentNote =
    notes.find(
      (note) =>
        note.id === id
    );

  if (!currentNote) {
    return undefined;
  }

  const updatedNote: Note = {
    ...currentNote,

    ...updatedData,

    id:
      currentNote.id,

    title:
      updatedData.title !==
      undefined
        ? updatedData.title.trim()
        : currentNote.title,

    description:
      updatedData.description !==
      undefined
        ? updatedData.description.trim()
        : currentNote.description,

    authorUserId:
      currentNote.authorUserId,

    createdAt:
      currentNote.createdAt,

    updatedAt:
      new Date().toISOString(),
  };

  notes = notes.map(
    (note) =>
      note.id === id
        ? updatedNote
        : note
  );

  saveNotesToStorage(
    notes
  );

  return updatedNote;
}

export function deleteNoteById(
  id: number
): boolean {
  const noteExists =
    notes.some(
      (note) =>
        note.id === id
    );

  if (!noteExists) {
    return false;
  }

  notes = notes.filter(
    (note) =>
      note.id !== id
  );

  saveNotesToStorage(
    notes
  );

  return true;
}