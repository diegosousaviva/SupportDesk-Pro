import { createAuditLog } from "./auditLogService";
import { createTicketAttachmentRecord, getTicketAttachmentRecord, listTicketAttachmentRecords } from "../repositories/ticketAttachmentRepository";
import type { TicketAttachment } from "../types/TicketAttachment";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["pdf", "doc", "docx", "xls", "xlsx", "csv", "txt", "jpg", "jpeg", "png", "webp"]);

export function getTicketAttachmentLimit(): number {
  return MAX_FILE_SIZE;
}

export function getTicketAttachmentExtensions(): string[] {
  return [...ALLOWED_EXTENSIONS];
}

export function validateTicketAttachment(file: File): string | undefined {
  if (!file.name.trim()) return "O arquivo deve possuir um nome.";
  if (file.size < 1) return `O arquivo "${file.name}" está vazio.`;
  if (file.size > MAX_FILE_SIZE) return `O arquivo "${file.name}" ultrapassa o limite de 20 MB.`;
  const extension = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "";
  if (!ALLOWED_EXTENSIONS.has(extension)) return `Formato não permitido para "${file.name}". Utilize PDF, Word, Excel, CSV, TXT ou imagens JPG, PNG e WEBP.`;
  return undefined;
}

export async function addTicketAttachment(ticketId: number, file: File, userId: number): Promise<TicketAttachment> {
  const validationError = validateTicketAttachment(file);
  if (validationError) throw new Error(validationError);
  const attachment = await createTicketAttachmentRecord(ticketId, file, userId);
  createAuditLog({
    module: "Chamados",
    action: "Upload",
    userId,
    userName: `Usuário #${userId}`,
    entityId: ticketId,
    description: `Anexo "${attachment.fileName}" enviado para o chamado #${ticketId}.`,
    details: `Tamanho: ${file.size} bytes`,
  });
  return attachment;
}

export async function getTicketAttachments(ticketId: number): Promise<TicketAttachment[]> {
  return listTicketAttachmentRecords(ticketId);
}

export async function downloadTicketAttachment(attachmentId: string): Promise<void> {
  const attachment = await getTicketAttachmentRecord(attachmentId);
  const objectUrl = URL.createObjectURL(attachment.file);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = attachment.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}
