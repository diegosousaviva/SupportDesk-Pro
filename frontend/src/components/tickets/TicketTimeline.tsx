import {
  AddCommentOutlined,
  AssignmentOutlined,
  CategoryOutlined,
  CloseOutlined,
  DescriptionOutlined,
  EditOutlined,
  FlagOutlined,
  LockOpenOutlined,
  PersonOutline,
  SaveOutlined,
  TaskAltOutlined,
  TitleOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  useState,
} from "react";

import {
  getTicketComments,
  updateTicketComment,
} from "../../services/ticketCommentService";

import {
  getTicketHistory,
} from "../../services/ticketHistoryService";

import type {
  TicketComment,
} from "../../types/TicketComment";

import type {
  TicketHistoryEntry,
  TicketHistoryEventType,
} from "../../types/TicketHistory";

import AddTicketComment from "./AddTicketComment";
import TimelineItem from "./TimelineItem";

interface TicketTimelineProps {
  ticketId: number;
  onAddComment?: (
    message: string
  ) => void;
  isAddingComment?: boolean;
  commentError?: string;
  onClearCommentError?: () => void;
}

type TimelineEntry =
  | {
      id: string;
      type: "comment";
      commentId: number;
      title: string;
      description: string;
      createdAt: string;
      updatedAt?: string;
      authorName: string;
    }
  | {
      id: string;
      type: "history";
      title: string;
      description: string;
      createdAt: string;
      eventType:
        TicketHistoryEventType;
    };

function getHistoryTitle(
  eventType:
    TicketHistoryEventType
): string {
  switch (eventType) {
    case "ticket_created":
      return "Chamado criado";

    case "title_changed":
      return "Título alterado";

    case "description_changed":
      return "Descrição atualizada";

    case "category_changed":
      return "Categoria alterada";

    case "priority_changed":
      return "Prioridade alterada";

    case "status_changed":
      return "Status alterado";

    case "technician_changed":
      return "Técnico responsável alterado";

    case "comment_added":
      return "Comentário adicionado";

    case "ticket_closed":
      return "Chamado encerrado";

    case "ticket_reopened":
      return "Chamado reaberto";

    default:
      return "Atividade registrada";
  }
}

function getHistoryIcon(
  eventType:
    TicketHistoryEventType
) {
  switch (eventType) {
    case "ticket_created":
      return (
        <AssignmentOutlined
          fontSize="small"
        />
      );

    case "title_changed":
      return (
        <TitleOutlined
          fontSize="small"
        />
      );

    case "description_changed":
      return (
        <DescriptionOutlined
          fontSize="small"
        />
      );

    case "category_changed":
      return (
        <CategoryOutlined
          fontSize="small"
        />
      );

    case "priority_changed":
      return (
        <FlagOutlined
          fontSize="small"
        />
      );

    case "status_changed":
    case "ticket_closed":
      return (
        <TaskAltOutlined
          fontSize="small"
        />
      );

    case "technician_changed":
      return (
        <PersonOutline
          fontSize="small"
        />
      );

    case "comment_added":
      return (
        <AddCommentOutlined
          fontSize="small"
        />
      );

    case "ticket_reopened":
      return (
        <LockOpenOutlined
          fontSize="small"
        />
      );

    default:
      return (
        <AssignmentOutlined
          fontSize="small"
        />
      );
  }
}

function buildTimelineEntries(
  comments: TicketComment[],
  history: TicketHistoryEntry[]
): TimelineEntry[] {
  const commentEntries:
    TimelineEntry[] =
      comments.map(
        (comment) => ({
          id: `comment-${comment.id}`,
          type: "comment",
          commentId: comment.id,
          title: "Comentário",
          description:
            comment.message,
          createdAt:
            comment.createdAt,
          updatedAt:
            comment.updatedAt,
          authorName:
            comment.authorName,
        })
      );

  const historyEntries:
    TimelineEntry[] =
      history
        .filter(
          (entry) =>
            entry.eventType !==
            "comment_added"
        )
        .map((entry) => ({
          id: `history-${entry.id}`,
          type: "history",
          title: getHistoryTitle(
            entry.eventType
          ),
          description:
            entry.description,
          createdAt:
            entry.createdAt,
          eventType:
            entry.eventType,
        }));

  return [
    ...commentEntries,
    ...historyEntries,
  ].sort(
    (
      firstEntry,
      secondEntry
    ) =>
      new Date(
        secondEntry.createdAt
      ).getTime() -
      new Date(
        firstEntry.createdAt
      ).getTime()
  );
}

export default function TicketTimeline({
  ticketId,
  onAddComment,
  isAddingComment = false,
  commentError = "",
  onClearCommentError,
}: TicketTimelineProps) {
  const [
    refreshKey,
    setRefreshKey,
  ] = useState(0);

  const [
    editingCommentId,
    setEditingCommentId,
  ] = useState<number | null>(
    null
  );

  const [
    editedMessage,
    setEditedMessage,
  ] = useState("");

  const [
    editingError,
    setEditingError,
  ] = useState("");

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  /*
   * Força uma nova leitura do LocalStorage
   * depois da edição de um comentário.
   */
  void refreshKey;

  const comments =
    getTicketComments(ticketId);

  const history =
    getTicketHistory(ticketId);

  const timelineEntries =
    buildTimelineEntries(
      comments,
      history
    );

  function startEditing(
    entry: Extract<
      TimelineEntry,
      { type: "comment" }
    >
  ): void {
    if (isSaving) {
      return;
    }

    setEditingCommentId(
      entry.commentId
    );

    setEditedMessage(
      entry.description
    );

    setEditingError("");
  }

  function cancelEditing(): void {
    if (isSaving) {
      return;
    }

    setEditingCommentId(null);
    setEditedMessage("");
    setEditingError("");
  }

  function saveEditing(): void {
    if (
      editingCommentId === null ||
      isSaving
    ) {
      return;
    }

    const normalizedMessage =
      editedMessage.trim();

    if (!normalizedMessage) {
      setEditingError(
        "Digite um comentário."
      );

      return;
    }

    setEditingError("");
    setIsSaving(true);

    try {
      updateTicketComment(
        editingCommentId,
        normalizedMessage
      );

      setRefreshKey(
        (currentValue) =>
          currentValue + 1
      );

      setEditingCommentId(null);
      setEditedMessage("");
    } catch (error) {
      console.error(
        "Não foi possível editar o comentário.",
        error
      );

      const failureMessage =
        error instanceof Error
          ? error.message
          : "Não foi possível editar o comentário.";

      setEditingError(
        failureMessage
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700 }}
        >
          Atividade do chamado
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          Acompanhe os comentários e
          as alterações realizadas
          neste chamado.
        </Typography>
      </Box>

      <Divider />

      {timelineEntries.length ===
      0 ? (
        <Alert severity="info">
          Este chamado ainda não
          possui atividades.
        </Alert>
      ) : (
        <Stack spacing={0}>
          {timelineEntries.map(
            (entry, index) => {
              const isLast =
                index ===
                timelineEntries.length -
                  1;

              if (
                entry.type ===
                "comment"
              ) {
                const isEditing =
                  editingCommentId ===
                  entry.commentId;

                return (
                  <TimelineItem
                    key={entry.id}
                    title={entry.title}
                    createdAt={
                      entry.createdAt
                    }
                    updatedAt={
                      entry.updatedAt
                    }
                    authorName={
                      entry.authorName
                    }
                    icon={
                      <AddCommentOutlined
                        fontSize="small"
                      />
                    }
                    isLast={isLast}
                    action={
                      isEditing ? (
                        <Stack
                          direction="row"
                          spacing={1}
                        >
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={
                              isSaving ? (
                                <CircularProgress
                                  size={15}
                                  color="inherit"
                                />
                              ) : (
                                <SaveOutlined />
                              )
                            }
                            onClick={
                              saveEditing
                            }
                            disabled={
                              isSaving
                            }
                          >
                            Salvar
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={
                              <CloseOutlined />
                            }
                            onClick={
                              cancelEditing
                            }
                            disabled={
                              isSaving
                            }
                          >
                            Cancelar
                          </Button>
                        </Stack>
                      ) : (
                        <Button
                          size="small"
                          startIcon={
                            <EditOutlined />
                          }
                          onClick={() =>
                            startEditing(
                              entry
                            )
                          }
                          disabled={
                            isSaving
                          }
                        >
                          Editar
                        </Button>
                      )
                    }
                    description={
                      isEditing ? (
                        <Stack
                          spacing={1}
                        >
                          {editingError && (
                            <Alert
                              severity="error"
                              onClose={() =>
                                setEditingError(
                                  ""
                                )
                              }
                            >
                              {
                                editingError
                              }
                            </Alert>
                          )}

                          <TextField
                            label="Editar comentário"
                            multiline
                            minRows={3}
                            fullWidth
                            value={
                              editedMessage
                            }
                            disabled={
                              isSaving
                            }
                            onChange={(
                              event
                            ) => {
                              setEditedMessage(
                                event
                                  .target
                                  .value
                              );

                              if (
                                editingError
                              ) {
                                setEditingError(
                                  ""
                                );
                              }
                            }}
                            helperText={`${editedMessage.length}/2000 caracteres`}
                            slotProps={{
                              htmlInput:
                                {
                                  maxLength:
                                    2000,
                                },
                            }}
                          />
                        </Stack>
                      ) : (
                        entry.description
                      )
                    }
                  />
                );
              }

              return (
                <TimelineItem
                  key={entry.id}
                  title={entry.title}
                  description={
                    entry.description
                  }
                  createdAt={
                    entry.createdAt
                  }
                  icon={getHistoryIcon(
                    entry.eventType
                  )}
                  isLast={isLast}
                />
              );
            }
          )}
        </Stack>
      )}

      <Divider />

      <Box>
        <Typography
          component="h3"
          variant="subtitle1"
          fontWeight={700}
          sx={{ mb: 2 }}
        >
          Adicionar comentário
        </Typography>

        {commentError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={
              onClearCommentError
            }
          >
            {commentError}
          </Alert>
        )}

        {onAddComment ? (
          <AddTicketComment
            onSubmit={onAddComment}
            disabled={
              isAddingComment
            }
          />
        ) : (
          <Alert severity="warning">
            Entre no sistema para
            adicionar comentários.
          </Alert>
        )}
      </Box>
    </Stack>
  );
}