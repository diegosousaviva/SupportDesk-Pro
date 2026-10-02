import type { CreateNoteData, Note, UpdateNoteData } from "../types/Note";
import { createData, deleteData, listData, updateData } from "../services/dataApi";

let notes: Note[] = [];

export async function refreshNotes(): Promise<Note[]> {
  notes = await listData<Note>("notes");
  return [...notes];
}
export function findAllNotes(): Note[] { return [...notes]; }
export function findNotesByAuthorUserId(authorUserId: number): Note[] { return notes.filter((note) => note.authorUserId === authorUserId); }
export function findNoteById(id: number): Note | undefined { return notes.find((note) => note.id === id); }
export async function createNoteRepository(data: CreateNoteData): Promise<Note> {
  const note = await createData<Note>("notes", data);
  notes = [note, ...notes];
  return note;
}
export async function updateNoteById(id: number, data: UpdateNoteData): Promise<Note | undefined> {
  const note = await updateData<Note>("notes", id, data);
  notes = notes.map((entry) => entry.id === id ? note : entry);
  return note;
}
export async function deleteNoteById(id: number): Promise<boolean> {
  await deleteData("notes", id);
  notes = notes.filter((note) => note.id !== id);
  return true;
}
