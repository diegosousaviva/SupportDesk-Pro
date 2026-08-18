import {
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  AttachFileOutlined,
  DeleteOutline,
  SaveOutlined,
  UploadFileOutlined,
} from "@mui/icons-material";

import TextField from "@mui/material/TextField";

import MainLayout from "../../components/layout/MainLayout";

import {
  useAuth,
} from "../../contexts/AuthContext";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

import {
  addNoteAttachment,
  getAllowedNoteAttachmentExtensions,
  getMaximumNoteAttachmentSize,
} from "../../services/noteAttachmentService";

import {
  createNote,
} from "../../services/noteService";

import type {
  NoteCategory,
} from "../../types/Note";

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
  if (
    size <
    1024
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

function CreateNotePage() {
  const navigate =
    useNavigate();

  const {
    user,
  } = useAuth();

  const {
    showSnackbar,
  } = useSnackbar();

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    category,
    setCategory,
  ] =
    useState<NoteCategory>(
      "Geral"
    );

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    selectedFiles,
    setSelectedFiles,
  ] = useState<File[]>([]);

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

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const allowedExtensions =
    getAllowedNoteAttachmentExtensions();

  const maximumFileSize =
    getMaximumNoteAttachmentSize();

  function handleBack(): void {
    if (
      isSubmitting
    ) {
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

    if (
      !normalizedTitle
    ) {
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

    if (
      !valid
    ) {
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

    if (
      invalidFile
    ) {
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

  function handleRemoveFile(
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

    if (!user) {
      const message =
        "Usuário não autenticado.";

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
      const createdNote =
        createNote(
          {
            title:
              title.trim(),

            description:
              description.trim(),

            category,
          },
          user
        );

      let uploadedFiles =
        0;

      const uploadErrors:
        string[] = [];

      for (
        const file of
        selectedFiles
      ) {
        try {
          await addNoteAttachment(
            createdNote.id,
            file,
            user
          );

          uploadedFiles +=
            1;
        } catch (error) {
          console.error(
            `Não foi possível anexar o arquivo ${file.name}.`,
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
          `A nota foi criada, mas ${uploadErrors.length} anexo(s) não puderam ser enviado(s).`,
          {
            severity:
              "warning",
          }
        );
      } else if (
        uploadedFiles >
        0
      ) {
        showSnackbar(
          `Nota criada com sucesso com ${uploadedFiles} anexo(s).`,
          {
            severity:
              "success",
          }
        );
      } else {
        showSnackbar(
          "Nota criada com sucesso.",
          {
            severity:
              "success",
          }
        );
      }

      navigate(
        `/notes/${createdNote.id}`
      );
    } catch (error) {
      console.error(
        "Não foi possível criar a nota.",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível criar a nota.";

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

  return (
    <MainLayout title="Nova nota">
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
          Voltar para notas
        </Button>

        <Typography
          variant="h4"
          component="h1"
          fontWeight={700}
        >
          Nova nota
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
          Registre informações,
          procedimentos,
          documentos e arquivos
          importantes.
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
                placeholder="Exemplo: Manual de configuração do roteador"
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
                required
                fullWidth
                disabled={
                  isSubmitting
                }
                slotProps={{
                  htmlInput: {
                    maxLength:
                      MAXIMUM_TITLE_LENGTH,
                  },
                }}
              />

              <FormControl
                fullWidth
                required
                disabled={
                  isSubmitting
                }
              >
                <InputLabel id="note-category-label">
                  Categoria
                </InputLabel>

                <Select
                  labelId="note-category-label"
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
                placeholder="Digite os detalhes da nota..."
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
                multiline
                minRows={8}
                required
                fullWidth
                disabled={
                  isSubmitting
                }
                slotProps={{
                  htmlInput: {
                    maxLength:
                      MAXIMUM_DESCRIPTION_LENGTH,
                  },
                }}
              />

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
                  <Box>
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
                        Anexos
                      </Typography>
                    </Stack>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt:
                          0.5,
                      }}
                    >
                      Adicione documentos
                      ou imagens relacionados
                      a esta nota.
                    </Typography>
                  </Box>

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
                    . Limite de{" "}
                    {formatFileSize(
                      maximumFileSize
                    )}{" "}
                    por arquivo.
                  </FormHelperText>

                  {selectedFiles.length ===
                    0 ? (
                    <Alert severity="info">
                      Nenhum arquivo
                      selecionado. Os anexos
                      são opcionais.
                    </Alert>
                  ) : (
                    <Stack spacing={1}>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                      >
                        {
                          selectedFiles.length
                        }{" "}
                        arquivo(s)
                        selecionado(s)
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

                                  flex:
                                    1,
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

                              <TooltipWrapper
                                title="Remover arquivo"
                              >
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() =>
                                    handleRemoveFile(
                                      index
                                    )
                                  }
                                  disabled={
                                    isSubmitting
                                  }
                                  aria-label={`Remover arquivo ${file.name}`}
                                >
                                  <DeleteOutline />
                                </IconButton>
                              </TooltipWrapper>
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
                    : "Salvar nota"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </MainLayout>
  );
}

interface TooltipWrapperProps {
  title: string;

  children:
    React.ReactElement;
}

function TooltipWrapper({
  title,
  children,
}: TooltipWrapperProps) {
  return (
    <Box
      component="span"
      title={
        title
      }
    >
      {children}
    </Box>
  );
}

export default CreateNotePage;