import {
  AddCommentOutlined,
  AssignmentOutlined,
  CategoryOutlined,
  DeleteOutline,
  DescriptionOutlined,
  FlagOutlined,
  PersonOutline,
  TaskAltOutlined,
  TitleOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import { useState } from "react";

import {
  createTicketComment,
  deleteTicketComment,
  getCommentsByTicketId,
} from "../../services/ticketCommentService";

import { getTicketHistory } from "../../services/ticketHistoryService";

import type { TicketComment } from "../../types/TicketComment";
import type {
  TicketHistoryEntry,
  TicketHistoryEventType,
} from "../../types/TicketHistory";

import TimelineItem from "./TimelineItem";

interface TicketTimelineProps {
  ticketId: number;
}

type TimelineEntry =
  | {
      id: string;
      type: "comment";
      title: string;
      description: string;
      createdAt: string;
      authorName: string;
      commentId: number;
    }
  | {
      id: string;
      type: "history";
      title: string;
      description: string;
      createdAt: string;
      eventType: TicketHistoryEventType;
    };

function getHistoryTitle(
  eventType: TicketHistoryEventType
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
  }
}

function getHistoryIcon(
  eventType: TicketHistoryEventType
) {
  switch (eventType) {
    case "ticket_created":
      return <AssignmentOutlined fontSize="small" />;

    case "title_changed":
      return <TitleOutlined fontSize="small" />;

    case "description_changed":
      return <DescriptionOutlined fontSize="small" />;

    case "category_changed":
      return <CategoryOutlined fontSize="small" />;

    case "priority_changed":
      return <FlagOutlined fontSize="small" />;

    case "status_changed":
      return <TaskAltOutlined fontSize="small" />;

    case "technician_changed":
      return <PersonOutline fontSize="small" />;
  }
}

function buildTimelineEntries(
  comments: TicketComment[],
  history: TicketHistoryEntry[]
): TimelineEntry[] {
  const commentEntries: TimelineEntry[] = comments.map(
    (comment) => ({
      id: `comment-${comment.id}`,
      type: "comment",
      title: "Comentário adicionado",
      description: comment.message,
      createdAt: comment.createdAt,
      authorName: comment.authorName,
      commentId: comment.id,
    })
  );

  const historyEntries: TimelineEntry[] = history.map(
    (entry) => ({
      id: `history-${entry.id}`,
      type: "history",
      title: getHistoryTitle(entry.eventType),
      description: entry.description,
      createdAt: entry.createdAt,
      eventType: entry.eventType,
    })
  );

  return [...commentEntries, ...historyEntries].sort(
    (firstEntry, secondEntry) =>
      new Date(secondEntry.createdAt).getTime() -
      new Date(firstEntry.createdAt).getTime()
  );
}

export default function TicketTimeline({
  ticketId,
}: TicketTimelineProps) {
  const [comments, setComments] = useState<TicketComment[]>(
    () => getCommentsByTicketId(ticketId)
  );

  const [history] = useState<TicketHistoryEntry[]>(
    () => getTicketHistory(ticketId)
  );

  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");

  const [validationError, setValidationError] =
    useState<string | null>(null);

  const timelineEntries = buildTimelineEntries(
    comments,
    history
  );

  function refreshComments(): void {
    setComments(getCommentsByTicketId(ticketId));
  }

  function handleSubmit(): void {
    const normalizedAuthorName = authorName.trim();
    const normalizedMessage = message.trim();

    if (!normalizedAuthorName) {
      setValidationError(
        "Informe o nome do autor do comentário."
      );
      return;
    }

    if (!normalizedMessage) {
      setValidationError(
        "Escreva uma mensagem antes de enviar."
      );
      return;
    }

    createTicketComment({
      ticketId,
      authorName: normalizedAuthorName,
      message: normalizedMessage,
    });

    setMessage("");
    setValidationError(null);

    refreshComments();
  }

  function handleDelete(commentId: number): void {
    const deleted = deleteTicketComment(commentId);

    if (deleted) {
      refreshComments();
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
          Acompanhe comentários e alterações realizadas
          neste chamado.
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: {
            xs: 2,
            md: 3,
          },
        }}
      >
        <Stack spacing={2}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700 }}
          >
            Adicionar comentário
          </Typography>

          {validationError && (
            <Alert
              severity="warning"
              onClose={() =>
                setValidationError(null)
              }
            >
              {validationError}
            </Alert>
          )}

          <TextField
            label="Nome do autor"
            value={authorName}
            onChange={(event) =>
              setAuthorName(event.target.value)
            }
            fullWidth
            size="small"
            slotProps={{
              htmlInput: {
                maxLength: 80,
              },
            }}
          />

          <TextField
            label="Comentário"
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            fullWidth
            multiline
            minRows={4}
            helperText={`${message.length}/2000 caracteres`}
            slotProps={{
              htmlInput: {
                maxLength: 2000,
              },
            }}
          />

          <Stack
            direction="row"
            justifyContent="flex-end"
          >
            <Button
              variant="contained"
              startIcon={<AddCommentOutlined />}
              onClick={handleSubmit}
            >
              Enviar comentário
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Divider />

      {timelineEntries.length === 0 ? (
        <Alert severity="info">
          Este chamado ainda não possui atividades.
        </Alert>
      ) : (
        <Stack spacing={0}>
          {timelineEntries.map((entry, index) => {
            const isLast =
              index === timelineEntries.length - 1;

            if (entry.type === "comment") {
              return (
                <TimelineItem
                  key={entry.id}
                  title={entry.title}
                  description={entry.description}
                  createdAt={entry.createdAt}
                  authorName={entry.authorName}
                  icon={
                    <AddCommentOutlined fontSize="small" />
                  }
                  isLast={isLast}
                  action={
                    <Tooltip title="Excluir comentário">
                      <IconButton
                        size="small"
                        color="error"
                        aria-label={`Excluir comentário de ${entry.authorName}`}
                        onClick={() =>
                          handleDelete(entry.commentId)
                        }
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                />
              );
            }

            return (
              <TimelineItem
                key={entry.id}
                title={entry.title}
                description={entry.description}
                createdAt={entry.createdAt}
                icon={getHistoryIcon(entry.eventType)}
                isLast={isLast}
              />
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}