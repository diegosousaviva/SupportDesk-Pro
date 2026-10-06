import type { TicketAttachment, StoredTicketAttachment } from "../types/TicketAttachment";
import { createData, getData, listData } from "../services/dataApi";

interface AttachmentRecord extends Omit<TicketAttachment, "id"> {
  id: number | string;
  contentBase64?: string;
}

function mapMetadata(record: AttachmentRecord): TicketAttachment {
  const { contentBase64: _contentBase64, ...metadata } = record;
  return { ...metadata, id: String(record.id) };
}

async function fileToBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

function base64ToBlob(base64: string, fileType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: fileType });
}

export async function createTicketAttachmentRecord(ticketId: number, file: File, uploadedByUserId: number): Promise<TicketAttachment> {
  const record = await createData<AttachmentRecord>("ticket-attachments", {
    ticketId,
    fileName: file.name,
    fileType: file.type || "application/octet-stream",
    fileSize: file.size,
    uploadedByUserId,
    contentBase64: await fileToBase64(file),
  });
  return mapMetadata(record);
}

export async function listTicketAttachmentRecords(ticketId: number): Promise<TicketAttachment[]> {
  const records = await listData<AttachmentRecord>("ticket-attachments");
  return records.filter((record) => record.ticketId === ticketId)
    .sort((first, second) => Date.parse(first.createdAt) - Date.parse(second.createdAt))
    .map(mapMetadata);
}

export async function getTicketAttachmentRecord(id: string): Promise<StoredTicketAttachment> {
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId < 1) throw new Error("Anexo inválido.");
  const record = await getData<AttachmentRecord>("ticket-attachments", numericId);
  if (!record.contentBase64) throw new Error("O servidor não retornou o conteúdo do anexo.");
  return { ...mapMetadata(record), file: base64ToBlob(record.contentBase64, record.fileType) };
}
