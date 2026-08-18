import {
  useEffect,
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  AttachFileOutlined,
  DeleteOutline,
  DownloadOutlined,
  SaveOutlined,
  UploadFileOutlined,
} from "@mui/icons-material";

import MainLayout from "../../components/layout/MainLayout";

import {
  useAuth,
} from "../../contexts/AuthContext";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

import {
  addNoteAttachment,
  downloadNoteAttachment,
  getAllowedNoteAttachmentExtensions,
  getMaximumNoteAttachmentSize,
  getNoteAttachments,
  removeNoteAttachment,
} from "../../services/noteAttachmentService";

import {
  getNoteByIdForUser,
  updateNote,
} from "../../services/noteService";

import type {
  NoteCategory,
} from "../../types/Note";

import type {
  NoteAttachment,
} from "../../types/NoteAttachment";

const MINIMUM_TITLE_LENGTH =
  3;

const MAXIMUM_TITLE_LENGTH =
  150;

const MINIMUM_DESCRIPTION_LENGTH =
  10;

const MAXIMUM_DESCRIPTION_LENGTH =
  10000;

const NOTE_CATEGORIES:
  NoteCategory[] = [
    "Geral",
    "Procedimento",
    "Documentação",
    "Inventário",
    "Chamado",
    "Loja",
    "Outro",
  ];

function formatFileSize(
  size: number
): string {
  if (size < 1024) {
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

function EditNotePage() {
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

  const noteId =
    Number(id);

  const note =
    user
      ? getNoteByIdForUser(
          noteId,
          user
        )
      : undefined;

  const [
    title,
    setTitle,
  ] = useState(
    note?.title ?? ""
  );

  const [
    category,
    setCategory,
  ] = useState<NoteCategory>(
    note?.category ??
      "Geral"
  );

  const [
    description,
    setDescription,
  ] = useState(
    note?.description ??
      ""
  );

  const [
    attachments,
    setAttachments,
  ] = useState<
    NoteAttachment[]
  >([]);

  const [
    selectedFiles,
    setSelectedFiles,
  ] = useState<File[]>([]);

  const [
    isLoadingAttachments,
    setIsLoadingAttachments,
  ] = useState(true);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    deletingAttachmentId,
    setDeletingAttachmentId,
  ] = useState<
    string | null
  >(null);

  const [
    downloadingAttachmentId,
    setDownloadingAttachmentId,
  ] = useState<
    string | null
  >(null);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    titleError,
    setTitleError,
  ] = useState("");

  const [
    descriptionError,
    setDescriptionError,
  ] = useState("");

  const allowedExtensions =
    getAllowedNoteAttachmentExtensions();

  const maximumFileSize =
    getMaximumNoteAttachmentSize();

  useEffect(
    () => {
      if (!note) {
        return;
      }

      setTitle(
        note.title
      );

      setCategory(
        note.category
      );

      setDescription(
        note.description
      );

      setTitleError(
        ""
      );

      setDescriptionError(
        ""
      );
    },
    [
      note?.id,
    ]
  );

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

        try {
          const noteAttachments =
            await getNoteAttachments(
              note.id,
              user
            );

          if (!cancelled) {
            setAttachments(
              noteAttachments
            );
          }
        } catch (error) {
          console.error(
            "Não foi possível carregar os anexos.",
            error
          );

          if (!cancelled) {
            setErrorMessage(
              "Não foi possível carregar os anexos da nota."
            );
          }
        } finally {
          if (!cancelled) {
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
    if (
      isSubmitting
    ) {
      return;
    }

    if (note) {
      navigate(
        `/notes/${note.id}`
      );

      return;
    }

    navigate(
      "/notes"
    );
  }

  function handleTitleChange(
    value: string
  ): void {
    setTitle(
      value
    );

    setTitleError(
      ""
    );

    setErrorMessage(
      ""
    );
  }

  function handleDescriptionChange(
    value: string
  ): void {
    setDescription(
      value
    );

    setDescriptionError(
      ""
    );

    setErrorMessage(
      ""
    );
  }

  function validateForm():
    boolean {
    const normalizedTitle =
      title.trim();

    const normalizedDescription =
      description.trim();

    let valid =
      true;

    setTitleError(
      ""
    );

    setDescriptionError(
      ""
    );

    if (!normalizedTitle) {
      setTitleError(
        "Informe o título da nota."
      );

      valid =
        false;
    } else if (
      normalizedTitle.length <
      MINIMUM_TITLE_LENGTH
    ) {
      setTitleError(
        `O título deve possuir pelo menos ${MINIMUM_TITLE_LENGTH} caracteres.`
      );

      valid =
        false;
    }

    if (
      !normalizedDescription
    ) {
      setDescriptionError(
        "Informe a descrição da nota."
      );

      valid =
        false;
    } else if (
      normalizedDescription.length <
      MINIMUM_DESCRIPTION_LENGTH
    ) {
      setDescriptionError(
        `A descrição deve possuir pelo menos ${MINIMUM_DESCRIPTION_LENGTH} caracteres.`
      );

      valid =
        false;
    }

    if (!valid) {
      setErrorMessage(
        "Revise os campos destacados antes de continuar."
      );
    }

    return valid;
  }

  function handleFileSelection(
    event:
      ChangeEvent<HTMLInputElement>
  ): void {
    const files =
      Array.from(
        event.target.files ??
          []
      );

    if (
      files.length ===
      0
    ) {
      return;
    }

    setErrorMessage("");

    const invalidFile =
      files.find(
        (file) =>
          file.size >
          maximumFileSize
      );

    if (invalidFile) {
      const message =
        `O arquivo "${invalidFile.name}" ultrapassa o limite de ${formatFileSize(
          maximumFileSize
        )}.`;

      setErrorMessage(
        message
      );

      showSnackbar(
        message,
        {
          severity:
            "warning",
        }
      );

      event.target.value =
        "";

      return;
    }

    setSelectedFiles(
      (
        currentFiles
      ) => {
        const newFiles = [
          ...currentFiles,
        ];

        files.forEach(
          (file) => {
            const alreadySelected =
              newFiles.some(
                (
                  currentFile
                ) =>
                  currentFile.name ===
                    file.name &&
                  currentFile.size ===
                    file.size &&
                  currentFile.lastModified ===
                    file.lastModified
              );

            if (
              !alreadySelected
            ) {
              newFiles.push(
                file
              );
            }
          }
        );

        return newFiles;
      }
    );

    event.target.value =
      "";
  }

  function handleRemoveSelectedFile(
    indexToRemove: number
  ): void {
    if (
      isSubmitting
    ) {
      return;
    }

    setSelectedFiles(
      (
        currentFiles
      ) =>
        currentFiles.filter(
          (
            _file,
            index
          ) =>
            index !==
            indexToRemove
        )
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

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    if (
      isSubmitting
    ) {
      return;
    }

    setErrorMessage("");

    if (
      !user ||
      !note
    ) {
      return;
    }

    if (
      !validateForm()
    ) {
      return;
    }

    setIsSubmitting(
      true
    );

    try {
      const updatedNote =
        updateNote(
          note.id,
          {
            title:
              title.trim(),

            description:
              description.trim(),

            category,
          },
          user
        );

      const uploadErrors:
        string[] = [];

      for (
        const file of
        selectedFiles
      ) {
        try {
          await addNoteAttachment(
            updatedNote.id,
            file,
            user
          );
        } catch (error) {
          console.error(
            `Não foi possível anexar ${file.name}.`,
            error
          );

          uploadErrors.push(
            file.name
          );
        }
      }

      if (
        uploadErrors.length >
        0
      ) {
        showSnackbar(
          `Nota atualizada, mas ${uploadErrors.length} anexo(s) não puderam ser enviado(s).`,
          {
            severity:
              "warning",
          }
        );
      } else {
        showSnackbar(
          "Nota atualizada com sucesso.",
          {
            severity:
              "success",
          }
        );
      }

      navigate(
        `/notes/${updatedNote.id}`
      );
    } catch (error) {
      console.error(
        "Não foi possível atualizar a nota.",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a nota.";

      setErrorMessage(
        message
      );

      showSnackbar(
        message,
        {
          severity:
            "error",
        }
      );
    } finally {
      setIsSubmitting(
        false
      );
    }
  }

  if (!user) {
    return (
      <MainLayout title="Editar nota">
        <Alert severity="error">
          Usuário não autenticado.
        </Alert>
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
      <MainLayout title="Editar nota">
        <Alert severity="warning">
          Nota não encontrada ou você não possui permissão para editá-la.
        </Alert>

        <Button
          variant="outlined"
          startIcon={
            <ArrowBack />
          }
          onClick={() =>
            navigate(
              "/notes"
            )
          }
          sx={{
            mt:
              2,
          }}
        >
          Voltar para notas
        </Button>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Editar nota">
      <Box
        sx={{
          maxWidth:
            900,
        }}
      >
        <Button
          variant="text"
          startIcon={
            <ArrowBack />
          }
          onClick={
            handleBack
          }
          disabled={
            isSubmitting
          }
          sx={{
            mb:
              1,
          }}
        >
          Voltar para nota
        </Button>

        <Typography
          variant="h4"
          component="h1"
          fontWeight={700}
        >
          Editar nota
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt:
              0.5,

            mb:
              3,
          }}
        >
          Atualize as informações e os anexos da nota #{note.id}.
        </Typography>

        {errorMessage && (
          <Alert
            severity="error"
            sx={{
              mb:
                3,
            }}
            onClose={
              isSubmitting
                ? undefined
                : () =>
                    setErrorMessage(
                      ""
                    )
            }
          >
            {errorMessage}
          </Alert>
        )}

        <Paper
          variant="outlined"
          sx={{
            p: {
              xs:
                2.5,

              md:
                4,
            },
          }}
        >
          <Box
            component="form"
            onSubmit={
              handleSubmit
            }
            noValidate
          >
            <Stack spacing={3}>
              <TextField
                label="Título"
                value={
                  title
                }
                onChange={(event) =>
                  handleTitleChange(
                    event.target.value
                  )
                }
                error={
                  Boolean(
                    titleError
                  )
                }
                helperText={
                  titleError ||
                  `${title.length}/${MAXIMUM_TITLE_LENGTH} caracteres — mínimo ${MINIMUM_TITLE_LENGTH}`
                }
                slotProps={{
                  htmlInput: {
                    maxLength:
                      MAXIMUM_TITLE_LENGTH,
                  },
                }}
                required
                fullWidth
                disabled={
                  isSubmitting
                }
              />

              <FormControl
                fullWidth
                required
                disabled={
                  isSubmitting
                }
              >
                <InputLabel id="edit-note-category-label">
                  Categoria
                </InputLabel>

                <Select
                  labelId="edit-note-category-label"
                  value={
                    category
                  }
                  label="Categoria"
                  onChange={(event) =>
                    setCategory(
                      event.target
                        .value as NoteCategory
                    )
                  }
                >
                  {NOTE_CATEGORIES.map(
                    (
                      currentCategory
                    ) => (
                      <MenuItem
                        key={
                          currentCategory
                        }
                        value={
                          currentCategory
                        }
                      >
                        {
                          currentCategory
                        }
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>

              <TextField
                label="Descrição"
                value={
                  description
                }
                onChange={(event) =>
                  handleDescriptionChange(
                    event.target.value
                  )
                }
                error={
                  Boolean(
                    descriptionError
                  )
                }
                helperText={
                  descriptionError ||
                  `${description.length}/${MAXIMUM_DESCRIPTION_LENGTH.toLocaleString(
                    "pt-BR"
                  )} caracteres — mínimo ${MINIMUM_DESCRIPTION_LENGTH}`
                }
                slotProps={{
                  htmlInput: {
                    maxLength:
                      MAXIMUM_DESCRIPTION_LENGTH,
                  },
                }}
                multiline
                minRows={8}
                required
                fullWidth
                disabled={
                  isSubmitting
                }
              />

              <Paper
                variant="outlined"
                sx={{
                  p:
                    2.5,
                }}
              >
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <AttachFileOutlined
                      color="primary"
                    />

                    <Typography
                      variant="h6"
                      fontWeight={700}
                    >
                      Anexos atuais
                    </Typography>
                  </Stack>

                  {isLoadingAttachments ? (
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                    >
                      <CircularProgress
                        size={20}
                      />

                      <Typography
                        color="text.secondary"
                      >
                        Carregando anexos...
                      </Typography>
                    </Stack>
                  ) : attachments.length ===
                    0 ? (
                    <Alert severity="info">
                      Esta nota ainda não possui anexos.
                    </Alert>
                  ) : (
                    <Stack
                      divider={
                        <Divider flexItem />
                      }
                    >
                      {attachments.map(
                        (
                          attachment
                        ) => (
                          <Stack
                            key={
                              attachment.id
                            }
                            direction="row"
                            spacing={2}
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{
                              py:
                                1.5,
                            }}
                          >
                            <Box
                              sx={{
                                minWidth:
                                  0,
                              }}
                            >
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                noWrap
                              >
                                {
                                  attachment.fileName
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatFileSize(
                                  attachment.fileSize
                                )}
                              </Typography>
                            </Box>

                            <Stack
                              direction="row"
                              spacing={0.5}
                            >
                              <Tooltip title="Baixar arquivo">
                                <span>
                                  <IconButton
                                    color="primary"
                                    disabled={
                                      isSubmitting ||
                                      downloadingAttachmentId ===
                                        attachment.id ||
                                      deletingAttachmentId ===
                                        attachment.id
                                    }
                                    onClick={() =>
                                      void handleDownloadAttachment(
                                        attachment
                                      )
                                    }
                                  >
                                    {downloadingAttachmentId ===
                                    attachment.id ? (
                                      <CircularProgress
                                        size={20}
                                      />
                                    ) : (
                                      <DownloadOutlined />
                                    )}
                                  </IconButton>
                                </span>
                              </Tooltip>

                              <Tooltip title="Excluir arquivo">
                                <span>
                                  <IconButton
                                    color="error"
                                    disabled={
                                      isSubmitting ||
                                      deletingAttachmentId ===
                                        attachment.id
                                    }
                                    onClick={() =>
                                      void handleDeleteAttachment(
                                        attachment
                                      )
                                    }
                                  >
                                    {deletingAttachmentId ===
                                    attachment.id ? (
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
                            </Stack>
                          </Stack>
                        )
                      )}
                    </Stack>
                  )}
                </Stack>
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  p:
                    2.5,

                  borderStyle:
                    "dashed",

                  backgroundColor:
                    "background.default",
                }}
              >
                <Stack spacing={2}>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    Adicionar novos anexos
                  </Typography>

                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={
                      <UploadFileOutlined />
                    }
                    disabled={
                      isSubmitting
                    }
                    sx={{
                      alignSelf:
                        "flex-start",
                    }}
                  >
                    Selecionar arquivos

                    <input
                      hidden
                      multiple
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.webp"
                      onChange={
                        handleFileSelection
                      }
                    />
                  </Button>

                  <FormHelperText>
                    Formatos permitidos:{" "}
                    {allowedExtensions
                      .map(
                        (
                          extension
                        ) =>
                          `.${extension}`
                      )
                      .join(", ")}
                    . Máximo de{" "}
                    {formatFileSize(
                      maximumFileSize
                    )}{" "}
                    por arquivo.
                  </FormHelperText>

                  {selectedFiles.length >
                    0 && (
                    <Stack spacing={1}>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                      >
                        Novos arquivos selecionados
                      </Typography>

                      {selectedFiles.map(
                        (
                          file,
                          index
                        ) => (
                          <Paper
                            key={`${file.name}-${file.size}-${file.lastModified}`}
                            variant="outlined"
                            sx={{
                              p:
                                1.5,
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={2}
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Box
                                sx={{
                                  minWidth:
                                    0,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  noWrap
                                >
                                  {
                                    file.name
                                  }
                                </Typography>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {formatFileSize(
                                    file.size
                                  )}
                                </Typography>
                              </Box>

                              <IconButton
                                color="error"
                                disabled={
                                  isSubmitting
                                }
                                onClick={() =>
                                  handleRemoveSelectedFile(
                                    index
                                  )
                                }
                                aria-label={`Remover arquivo ${file.name}`}
                              >
                                <DeleteOutline />
                              </IconButton>
                            </Stack>
                          </Paper>
                        )
                      )}
                    </Stack>
                  )}
                </Stack>
              </Paper>

              <Stack
                direction={{
                  xs:
                    "column",

                  sm:
                    "row",
                }}
                spacing={1}
                justifyContent="flex-end"
              >
                <Button
                  variant="outlined"
                  onClick={
                    handleBack
                  }
                  disabled={
                    isSubmitting
                  }
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress
                        size={18}
                        color="inherit"
                      />
                    ) : (
                      <SaveOutlined />
                    )
                  }
                  disabled={
                    isSubmitting
                  }
                >
                  {isSubmitting
                    ? "Salvando..."
                    : "Salvar alterações"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </MainLayout>
  );
}

export default EditNotePage;