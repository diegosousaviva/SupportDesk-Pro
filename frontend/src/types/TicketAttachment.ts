export interface TicketAttachment {
  id: string;
  ticketId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedByUserId: number;
  createdAt: string;
}

export interface StoredTicketAttachment extends TicketAttachment {
  file: Blob;
}
