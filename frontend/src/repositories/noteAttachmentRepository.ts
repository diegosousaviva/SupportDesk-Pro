import type { CreateNoteAttachmentData, NoteAttachment, StoredNoteAttachment } from "../types/NoteAttachment";
import { createData, deleteData, getData, listData } from "../services/dataApi";

interface AttachmentRecord extends Omit<NoteAttachment, "id"> {
  id: number | string;
  contentBase64?: string;
}

function mapMetadata(record: AttachmentRecord): NoteAttachment {
  return { ...record, id: String(record.id) };
}

async function toBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

function toBlob(base64: string, fileType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: fileType });
}

export async function createNoteAttachmentRepository(data: CreateNoteAttachmentData): Promise<NoteAttachment> {
  const record = await createData<AttachmentRecord>("note-attachments", {
    noteId: data.noteId,
    fileName: data.file.name,
    fileType: data.file.type || "application/octet-stream",
    fileSize: data.file.size,
    uploadedByUserId: data.uploadedByUserId,
    contentBase64: await toBase64(data.file),
  });
  return mapMetadata(record);
}

export async function findNoteAttachmentsByNoteId(noteId: number): Promise<NoteAttachment[]> {
  const records = await listData<AttachmentRecord>("note-attachments");
  return records.filter((record) => record.noteId === noteId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .map(mapMetadata);
}

export async function findNoteAttachmentById(id: string): Promise<StoredNoteAttachment | undefined> {
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId < 1) return undefined;
  const record = await getData<AttachmentRecord>("note-attachments", numericId);
  if (!record.contentBase64) throw new Error("O servidor não retornou o conteúdo do anexo.");
  return { ...mapMetadata(record), file: toBlob(record.contentBase64, record.fileType) };
}

export async function deleteNoteAttachmentById(id: string): Promise<boolean> {
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId < 1) return false;
  await deleteData("note-attachments", numericId);
  return true;
}

export async function deleteNoteAttachmentsByNoteId(noteId: number): Promise<void> {
  const attachments = await findNoteAttachmentsByNoteId(noteId);
  await Promise.all(attachments.map((attachment) => deleteNoteAttachmentById(attachment.id)));
}
