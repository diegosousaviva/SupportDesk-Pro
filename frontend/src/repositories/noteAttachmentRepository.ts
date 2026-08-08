import type {
  CreateNoteAttachmentData,
  NoteAttachment,
  StoredNoteAttachment,
} from "../types/NoteAttachment";

const DATABASE_NAME =
  "supportdesk-pro-database";

const DATABASE_VERSION = 1;

const ATTACHMENT_STORE_NAME =
  "note-attachments";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise(
    (resolve, reject) => {
      const request =
        indexedDB.open(
          DATABASE_NAME,
          DATABASE_VERSION
        );

      request.onupgradeneeded =
        () => {
          const database =
            request.result;

          if (
            !database.objectStoreNames.contains(
              ATTACHMENT_STORE_NAME
            )
          ) {
            const store =
              database.createObjectStore(
                ATTACHMENT_STORE_NAME,
                {
                  keyPath: "id",
                }
              );

            store.createIndex(
              "noteId",
              "noteId",
              {
                unique: false,
              }
            );

            store.createIndex(
              "uploadedByUserId",
              "uploadedByUserId",
              {
                unique: false,
              }
            );
          }
        };

      request.onsuccess =
        () => {
          resolve(
            request.result
          );
        };

      request.onerror =
        () => {
          reject(
            request.error ??
              new Error(
                "Não foi possível abrir o banco de anexos."
              )
          );
        };

      request.onblocked =
        () => {
          reject(
            new Error(
              "A abertura do banco de anexos foi bloqueada."
            )
          );
        };
    }
  );
}

function createAttachmentId(): string {
  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return crypto.randomUUID();
  }

  return [
    Date.now(),
    Math.random()
      .toString(36)
      .slice(2),
  ].join("-");
}

function toAttachmentMetadata(
  attachment: StoredNoteAttachment
): NoteAttachment {
  return {
    id:
      attachment.id,

    noteId:
      attachment.noteId,

    fileName:
      attachment.fileName,

    fileType:
      attachment.fileType,

    fileSize:
      attachment.fileSize,

    uploadedByUserId:
      attachment.uploadedByUserId,

    createdAt:
      attachment.createdAt,
  };
}

export async function createNoteAttachmentRepository(
  attachmentData: CreateNoteAttachmentData
): Promise<NoteAttachment> {
  const database =
    await openDatabase();

  const attachment:
    StoredNoteAttachment = {
      id:
        createAttachmentId(),

      noteId:
        attachmentData.noteId,

      fileName:
        attachmentData.file.name,

      fileType:
        attachmentData.file.type ||
        "application/octet-stream",

      fileSize:
        attachmentData.file.size,

      uploadedByUserId:
        attachmentData.uploadedByUserId,

      createdAt:
        new Date().toISOString(),

      file:
        attachmentData.file,
    };

  return new Promise(
    (resolve, reject) => {
      const transaction =
        database.transaction(
          ATTACHMENT_STORE_NAME,
          "readwrite"
        );

      const store =
        transaction.objectStore(
          ATTACHMENT_STORE_NAME
        );

      const request =
        store.add(
          attachment
        );

      request.onsuccess =
        () => {
          resolve(
            toAttachmentMetadata(
              attachment
            )
          );
        };

      request.onerror =
        () => {
          reject(
            request.error ??
              new Error(
                "Não foi possível salvar o anexo."
              )
          );
        };

      transaction.oncomplete =
        () => {
          database.close();
        };

      transaction.onerror =
        () => {
          database.close();
        };

      transaction.onabort =
        () => {
          database.close();
        };
    }
  );
}

export async function findNoteAttachmentsByNoteId(
  noteId: number
): Promise<NoteAttachment[]> {
  const database =
    await openDatabase();

  return new Promise(
    (resolve, reject) => {
      const transaction =
        database.transaction(
          ATTACHMENT_STORE_NAME,
          "readonly"
        );

      const store =
        transaction.objectStore(
          ATTACHMENT_STORE_NAME
        );

      const index =
        store.index(
          "noteId"
        );

      const request =
        index.getAll(
          noteId
        );

      request.onsuccess =
        () => {
          const attachments =
            (
              request.result as
                StoredNoteAttachment[]
            )
              .map(
                toAttachmentMetadata
              )
              .sort(
                (
                  firstAttachment,
                  secondAttachment
                ) =>
                  new Date(
                    secondAttachment.createdAt
                  ).getTime() -
                  new Date(
                    firstAttachment.createdAt
                  ).getTime()
              );

          resolve(
            attachments
          );
        };

      request.onerror =
        () => {
          reject(
            request.error ??
              new Error(
                "Não foi possível carregar os anexos."
              )
          );
        };

      transaction.oncomplete =
        () => {
          database.close();
        };

      transaction.onerror =
        () => {
          database.close();
        };

      transaction.onabort =
        () => {
          database.close();
        };
    }
  );
}

export async function findNoteAttachmentById(
  attachmentId: string
): Promise<
  StoredNoteAttachment | undefined
> {
  const database =
    await openDatabase();

  return new Promise(
    (resolve, reject) => {
      const transaction =
        database.transaction(
          ATTACHMENT_STORE_NAME,
          "readonly"
        );

      const store =
        transaction.objectStore(
          ATTACHMENT_STORE_NAME
        );

      const request =
        store.get(
          attachmentId
        );

      request.onsuccess =
        () => {
          resolve(
            request.result as
              | StoredNoteAttachment
              | undefined
          );
        };

      request.onerror =
        () => {
          reject(
            request.error ??
              new Error(
                "Não foi possível localizar o anexo."
              )
          );
        };

      transaction.oncomplete =
        () => {
          database.close();
        };

      transaction.onerror =
        () => {
          database.close();
        };

      transaction.onabort =
        () => {
          database.close();
        };
    }
  );
}

export async function deleteNoteAttachmentById(
  attachmentId: string
): Promise<boolean> {
  const existingAttachment =
    await findNoteAttachmentById(
      attachmentId
    );

  if (!existingAttachment) {
    return false;
  }

  const database =
    await openDatabase();

  return new Promise(
    (resolve, reject) => {
      const transaction =
        database.transaction(
          ATTACHMENT_STORE_NAME,
          "readwrite"
        );

      const store =
        transaction.objectStore(
          ATTACHMENT_STORE_NAME
        );

      const request =
        store.delete(
          attachmentId
        );

      request.onsuccess =
        () => {
          resolve(true);
        };

      request.onerror =
        () => {
          reject(
            request.error ??
              new Error(
                "Não foi possível excluir o anexo."
              )
          );
        };

      transaction.oncomplete =
        () => {
          database.close();
        };

      transaction.onerror =
        () => {
          database.close();
        };

      transaction.onabort =
        () => {
          database.close();
        };
    }
  );
}

export async function deleteNoteAttachmentsByNoteId(
  noteId: number
): Promise<void> {
  const database =
    await openDatabase();

  return new Promise(
    (resolve, reject) => {
      const transaction =
        database.transaction(
          ATTACHMENT_STORE_NAME,
          "readwrite"
        );

      const store =
        transaction.objectStore(
          ATTACHMENT_STORE_NAME
        );

      const index =
        store.index(
          "noteId"
        );

      const request =
        index.openKeyCursor(
          IDBKeyRange.only(
            noteId
          )
        );

      request.onsuccess =
        () => {
          const cursor =
            request.result;

          if (!cursor) {
            return;
          }

          store.delete(
            cursor.primaryKey
          );

          cursor.continue();
        };

      request.onerror =
        () => {
          reject(
            request.error ??
              new Error(
                "Não foi possível localizar os anexos da nota."
              )
          );
        };

      transaction.oncomplete =
        () => {
          database.close();

          resolve();
        };

      transaction.onerror =
        () => {
          database.close();

          reject(
            transaction.error ??
              new Error(
                "Não foi possível excluir os anexos da nota."
              )
          );
        };

      transaction.onabort =
        () => {
          database.close();

          reject(
            transaction.error ??
              new Error(
                "A exclusão dos anexos foi cancelada."
              )
          );
        };
    }
  );
}