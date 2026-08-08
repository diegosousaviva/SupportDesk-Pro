import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  AttachFileOutlined,
  DeleteOutline,
  DownloadOutlined,
  EditOutlined,
  NoteOutlined,
  PersonOutline,
} from "@mui/icons-material";

import InfoCard from "../../components/common/InfoCard";
import MainLayout from "../../components/layout/MainLayout";

import {
  useAuth,
} from "../../contexts/AuthContext";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

import {
  downloadNoteAttachment,
  getNoteAttachments,
  removeNoteAttachment,
} from "../../services/noteAttachmentService";

import {
  canUserManageNote,
  getNoteByIdForUser,
} from "../../services/noteService";

import {
  getUserById,
} from "../../services/userService";

import type {
  NoteCategory,
} from "../../types/Note";

import type {
  NoteAttachment,
} from "../../types/NoteAttachment";

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

function getCategoryColor(
  category: NoteCategory
): ChipColor {
  switch (category) {
    case "Procedimento":
      return "primary";

    case "Documentação":
      return "info";

    case "Inventário":
      return "success";

    case "Chamado":
      return "warning";

    case "Loja":
      return "secondary";

    case "Geral":
    case "Outro":
    default:
      return "default";
  }
}

function formatDateTime(
  value: string
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Data inválida";
  }

  return date.toLocaleString(
    "pt-BR"
  );
}

function formatFileSize(
  size: number
): string {
  if (
    size < 1024
  ) {
    return `${size} B`;
  }

  if (
    size <
    1024 * 1024
  ) {
    return `${(
      size / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function NoteDetailsPage() {
  const navigate =
    useNavigate();

  const {
    id,
  } = useParams();

  const {
    user,
  } = useAuth();

  const {
    showSnackbar,
  } = useSnackbar();

  const [
    attachments,
    setAttachments,
  ] = useState<
    NoteAttachment[]
  >([]);

  const [
    isLoadingAttachments,
    setIsLoadingAttachments,
  ] = useState(true);

  const [
    attachmentError,
    setAttachmentError,
  ] = useState("");

  const [
    downloadingAttachmentId,
    setDownloadingAttachmentId,
  ] = useState<
    string | null
  >(null);

  const [
    deletingAttachmentId,
    setDeletingAttachmentId,
  ] = useState<
    string | null
  >(null);

  const noteId =
    Number(id);

  const note =
    user
      ? getNoteByIdForUser(
          noteId,
          user
        )
      : undefined;

  useEffect(
    () => {
      let cancelled =
        false;

      async function loadAttachments(): Promise<void> {
        if (
          !user ||
          !note
        ) {
          setIsLoadingAttachments(
            false
          );

          return;
        }

        setIsLoadingAttachments(
          true
        );

        setAttachmentError(
          ""
        );

        try {
          const noteAttachments =
            await getNoteAttachments(
              note.id,
              user
            );

          if (
            !cancelled
          ) {
            setAttachments(
              noteAttachments
            );
          }
        } catch (error) {
          console.error(
            "Não foi possível carregar os anexos da nota.",
            error
          );

          if (
            !cancelled
          ) {
            setAttachmentError(
              "Não foi possível carregar os anexos desta nota."
            );
          }
        } finally {
          if (
            !cancelled
          ) {
            setIsLoadingAttachments(
              false
            );
          }
        }
      }

      void loadAttachments();

      return () => {
        cancelled =
          true;
      };
    },
    [
      note?.id,
      user,
    ]
  );

  function handleBack(): void {
    navigate(
      "/notes"
    );
  }

  function handleEdit(): void {
    if (!note) {
      return;
    }

    navigate(
      `/notes/${note.id}/edit`
    );
  }

  async function handleDownloadAttachment(
    attachment:
      NoteAttachment
  ): Promise<void> {
    if (!user) {
      return;
    }

    setDownloadingAttachmentId(
      attachment.id
    );

    try {
      await downloadNoteAttachment(
        attachment.id,
        user
      );

      showSnackbar(
        "Download iniciado.",
        {
          severity:
            "success",
        }
      );
    } catch (error) {
      console.error(
        "Não foi possível baixar o anexo.",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível baixar o anexo.";

      showSnackbar(
        message,
        {
          severity:
            "error",
        }
      );
    } finally {
      setDownloadingAttachmentId(
        null
      );
    }
  }

  async function handleDeleteAttachment(
    attachment:
      NoteAttachment
  ): Promise<void> {
    if (
      !user ||
      !note
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Deseja realmente excluir o arquivo "${attachment.fileName}"?`
      );

    if (!confirmed) {
      return;
    }

    setDeletingAttachmentId(
      attachment.id
    );

    try {
      const deleted =
        await removeNoteAttachment(
          attachment.id,
          user
        );

      if (!deleted) {
        throw new Error(
          "O anexo não foi encontrado."
        );
      }

      const updatedAttachments =
        await getNoteAttachments(
          note.id,
          user
        );

      setAttachments(
        updatedAttachments
      );

      showSnackbar(
        "Anexo excluído com sucesso.",
        {
          severity:
            "success",
        }
      );
    } catch (error) {
      console.error(
        "Não foi possível excluir o anexo.",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o anexo.";

      showSnackbar(
        message,
        {
          severity:
            "error",
        }
      );
    } finally {
      setDeletingAttachmentId(
        null
      );
    }
  }

  if (
    !user
  ) {
    return (
      <MainLayout title="Detalhes da nota">
        <Alert severity="error">
          Usuário não autenticado.
        </Alert>

        <Button
          sx={{
            mt: 2,
          }}
          variant="outlined"
          startIcon={
            <ArrowBack />
          }
          onClick={
            handleBack
          }
        >
          Voltar para notas
        </Button>
      </MainLayout>
    );
  }

  if (
    !Number.isInteger(
      noteId
    ) ||
    noteId <= 0 ||
    !note
  ) {
    return (
      <MainLayout title="Detalhes da nota">
        <Alert severity="warning">
          Nota não encontrada ou você não possui permissão para visualizá-la.
        </Alert>

        <Button
          sx={{
            mt: 2,
          }}
          variant="outlined"
          startIcon={
            <ArrowBack />
          }
          onClick={
            handleBack
          }
        >
          Voltar para notas
        </Button>
      </MainLayout>
    );
  }

  const author =
    getUserById(
      note.authorUserId
    );

  const canManage =
    canUserManageNote(
      note,
      user
    );

  return (
    <MainLayout title="Detalhes da nota">
      <Stack spacing={3}>
        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            md: "center",
          }}
        >
          <Box>
            <Button
              variant="text"
              startIcon={
                <ArrowBack />
              }
              onClick={
                handleBack
              }
              sx={{
                mb: 1,
              }}
            >
              Voltar para notas
            </Button>

            <Typography
              variant="h4"
              component="h1"
              fontWeight={700}
            >
              {note.title}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                mt: 1,
              }}
            >
              <Chip
                label={
                  note.category
                }
                size="small"
                color={getCategoryColor(
                  note.category
                )}
                variant="outlined"
              />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Nota #{note.id}
              </Typography>
            </Stack>
          </Box>

          {canManage && (
            <Button
              variant="contained"
              startIcon={
                <EditOutlined />
              }
              onClick={
                handleEdit
              }
            >
              Editar nota
            </Button>
          )}
        </Stack>

        <InfoCard
          title="Informações da nota"
          icon={
            <NoteOutlined color="primary" />
          }
        >
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={4}
          >
            <Box flex={1}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Categoria
              </Typography>

              <Typography
                fontWeight={600}
              >
                {note.category}
              </Typography>
            </Box>

            <Box flex={1}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Criada em
              </Typography>

              <Typography>
                {formatDateTime(
                  note.createdAt
                )}
              </Typography>
            </Box>

            <Box flex={1}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Última atualização
              </Typography>

              <Typography>
                {formatDateTime(
                  note.updatedAt
                )}
              </Typography>
            </Box>
          </Stack>
        </InfoCard>

        <InfoCard
          title="Autor"
          icon={
            <PersonOutline color="primary" />
          }
        >
          <Stack spacing={0.5}>
            <Typography
              fontWeight={700}
            >
              {author?.name ??
                `Usuário #${note.authorUserId}`}
            </Typography>

            {author?.email && (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {author.email}
              </Typography>
            )}
          </Stack>
        </InfoCard>

        <InfoCard
          title="Descrição"
          icon={
            <NoteOutlined color="primary" />
          }
        >
          <Typography
            sx={{
              whiteSpace:
                "pre-wrap",

              wordBreak:
                "break-word",

              lineHeight:
                1.7,
            }}
          >
            {note.description}
          </Typography>
        </InfoCard>

        <InfoCard
          title={`Anexos (${attachments.length})`}
          icon={
            <AttachFileOutlined color="primary" />
          }
        >
          {isLoadingAttachments ? (
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="center"
              sx={{
                py: 4,
              }}
            >
              <CircularProgress
                size={24}
              />

              <Typography
                color="text.secondary"
              >
                Carregando anexos...
              </Typography>
            </Stack>
          ) : attachmentError ? (
            <Alert severity="error">
              {attachmentError}
            </Alert>
          ) : attachments.length ===
            0 ? (
            <Alert severity="info">
              Esta nota não possui arquivos anexados.
            </Alert>
          ) : (
            <Stack
              spacing={0}
              divider={
                <Divider flexItem />
              }
            >
              {attachments.map(
                (
                  attachment
                ) => {
                  const isDownloading =
                    downloadingAttachmentId ===
                    attachment.id;

                  const isDeleting =
                    deletingAttachmentId ===
                    attachment.id;

                  return (
                    <Stack
                      key={
                        attachment.id
                      }
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      spacing={2}
                      justifyContent="space-between"
                      alignItems={{
                        xs: "stretch",
                        sm: "center",
                      }}
                      sx={{
                        py: 2,

                        "&:first-of-type": {
                          pt: 0,
                        },

                        "&:last-of-type": {
                          pb: 0,
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        sx={{
                          minWidth:
                            0,
                        }}
                      >
                        <AttachFileOutlined
                          color="action"
                        />

                        <Box
                          sx={{
                            minWidth:
                              0,
                          }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{
                              overflow:
                                "hidden",

                              textOverflow:
                                "ellipsis",

                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {attachment.fileName}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {formatFileSize(
                              attachment.fileSize
                            )}
                            {" • "}
                            Enviado em{" "}
                            {formatDateTime(
                              attachment.createdAt
                            )}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent={{
                          xs: "flex-end",
                          sm: "initial",
                        }}
                      >
                        <Tooltip title="Baixar arquivo">
                          <span>
                            <IconButton
                              color="primary"
                              disabled={
                                isDownloading ||
                                isDeleting
                              }
                              onClick={() =>
                                void handleDownloadAttachment(
                                  attachment
                                )
                              }
                              aria-label={`Baixar arquivo ${attachment.fileName}`}
                            >
                              {isDownloading ? (
                                <CircularProgress
                                  size={20}
                                />
                              ) : (
                                <DownloadOutlined />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>

                        {canManage && (
                          <Tooltip title="Excluir arquivo">
                            <span>
                              <IconButton
                                color="error"
                                disabled={
                                  isDownloading ||
                                  isDeleting
                                }
                                onClick={() =>
                                  void handleDeleteAttachment(
                                    attachment
                                  )
                                }
                                aria-label={`Excluir arquivo ${attachment.fileName}`}
                              >
                                {isDeleting ? (
                                  <CircularProgress
                                    size={20}
                                    color="inherit"
                                  />
                                ) : (
                                  <DeleteOutline />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </Stack>
                    </Stack>
                  );
                }
              )}
            </Stack>
          )}
        </InfoCard>

        <Button
          variant="outlined"
          startIcon={
            <ArrowBack />
          }
          onClick={
            handleBack
          }
          sx={{
            alignSelf:
              "flex-start",
          }}
        >
          Voltar para notas
        </Button>
      </Stack>
    </MainLayout>
  );
}

export default NoteDetailsPage;