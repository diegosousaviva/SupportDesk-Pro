export interface NoteAttachment {
  id: string;

  noteId: number;

  fileName: string;

  fileType: string;

  fileSize: number;

  uploadedByUserId: number;

  createdAt: string;
}

export interface StoredNoteAttachment
  extends NoteAttachment {
  file: Blob;
}

export interface CreateNoteAttachmentData {
  noteId: number;

  file: File;

  uploadedByUserId: number;
}