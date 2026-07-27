import {
  Alert,
  Avatar,
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

import {
  AddCommentOutlined,
  DeleteOutline,
} from "@mui/icons-material";

import { useState } from "react";

import {
  createTicketComment,
  deleteTicketComment,
  getCommentsByTicketId,
} from "../../services/ticketCommentService";

import type { TicketComment } from "../../types/TicketComment";

interface TicketCommentsProps {
  ticketId: number;
}

function formatCommentDate(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Data não disponível";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getAuthorInitial(authorName: string): string {
  const normalizedName = authorName.trim();

  if (!normalizedName) {
    return "?";
  }

  return normalizedName.charAt(0).toUpperCase();
}

export default function TicketComments({
  ticketId,
}: TicketCommentsProps) {
  const [comments, setComments] = useState<TicketComment[]>(
    () => getCommentsByTicketId(ticketId)
  );

  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] =
    useState<string | null>(null);

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
          Comentários
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          Registre atualizações, diagnósticos e soluções
          relacionadas ao chamado.
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
              onClose={() => setValidationError(null)}
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
            inputProps={{
              maxLength: 80,
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
            inputProps={{
              maxLength: 2000,
            }}
            helperText={`${message.length}/2000 caracteres`}
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

      {comments.length === 0 ? (
        <Alert severity="info">
          Este chamado ainda não possui comentários.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {comments.map((comment) => (
            <Paper
              key={comment.id}
              variant="outlined"
              sx={{
                p: {
                  xs: 2,
                  md: 3,
                },
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="flex-start"
              >
                <Avatar>
                  {getAuthorInitial(comment.authorName)}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    justifyContent="space-between"
                    alignItems={{
                      xs: "flex-start",
                      sm: "center",
                    }}
                    spacing={1}
                  >
                    <Box>
                      <Typography
                        sx={{ fontWeight: 700 }}
                      >
                        {comment.authorName}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {formatCommentDate(
                          comment.createdAt
                        )}
                      </Typography>
                    </Box>

                    <Tooltip title="Excluir comentário">
                      <IconButton
                        size="small"
                        color="error"
                        aria-label={`Excluir comentário de ${comment.authorName}`}
                        onClick={() =>
                          handleDelete(comment.id)
                        }
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Typography
                    sx={{
                      whiteSpace: "pre-line",
                      overflowWrap: "anywhere",
                      lineHeight: 1.7,
                    }}
                  >
                    {comment.message}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}