import type { TicketComment } from "../types/TicketComment";

const STORAGE_KEY = "supportdesk-pro-ticket-comments";

export type CreateTicketCommentData = Omit<
  TicketComment,
  "id" | "createdAt"
>;

function saveCommentsToStorage(
  commentsToSave: TicketComment[]
): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(commentsToSave)
    );
  } catch (error) {
    console.error(
      "Não foi possível salvar os comentários no Local Storage.",
      error
    );
  }
}

function loadCommentsFromStorage(): TicketComment[] {
  try {
    const storedComments = localStorage.getItem(STORAGE_KEY);

    if (!storedComments) {
      return [];
    }

    const parsedData: unknown = JSON.parse(storedComments);

    if (!Array.isArray(parsedData)) {
      return [];
    }

    return parsedData.filter(
      (comment): comment is TicketComment =>
        typeof comment === "object" &&
        comment !== null &&
        typeof comment.id === "number" &&
        typeof comment.ticketId === "number" &&
        typeof comment.authorName === "string" &&
        typeof comment.message === "string" &&
        typeof comment.createdAt === "string"
    );
  } catch (error) {
    console.error(
      "Não foi possível carregar os comentários do Local Storage.",
      error
    );

    return [];
  }
}

let comments: TicketComment[] =
  loadCommentsFromStorage();

export function findCommentsByTicketId(
  ticketId: number
): TicketComment[] {
  return comments
    .filter((comment) => comment.ticketId === ticketId)
    .sort(
      (firstComment, secondComment) =>
        new Date(firstComment.createdAt).getTime() -
        new Date(secondComment.createdAt).getTime()
    );
}

export function createTicketCommentRepository(
  commentData: CreateTicketCommentData
): TicketComment {
  const highestId = comments.reduce(
    (currentHighestId, comment) =>
      Math.max(currentHighestId, comment.id),
    0
  );

  const newComment: TicketComment = {
    ...commentData,
    id: highestId + 1,
    createdAt: new Date().toISOString(),
  };

  comments = [...comments, newComment];

  saveCommentsToStorage(comments);

  return newComment;
}

export function deleteTicketCommentById(
  id: number
): boolean {
  const commentExists = comments.some(
    (comment) => comment.id === id
  );

  if (!commentExists) {
    return false;
  }

  comments = comments.filter(
    (comment) => comment.id !== id
  );

  saveCommentsToStorage(comments);

  return true;
}