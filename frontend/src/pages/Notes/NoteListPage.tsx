import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Stack,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  AddOutlined,
  DeleteOutline,
  EditOutlined,
  NoteOutlined,
  SearchOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";

import {
  useAuth,
} from "../../hooks/useAuth";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

import {
  deleteNote,
  getNotesForUser,
} from "../../services/noteService";
import { refreshNotes } from "../../repositories/noteRepository";

import {
  getUserById,
} from "../../services/userService";

import type {
  Note,
  NoteCategory,
} from "../../types/Note";
import { getActiveStores, getStoreById } from "../../services/storeService";

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

function formatNoteDate(value: string | undefined, fallback: string): string {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }
  return formatDateTime(fallback).split(",")[0];
}

function getCategoryColor(
  category: NoteCategory
):
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning" {
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

    case "Outro":
      return "default";

    case "Geral":
    default:
      return "default";
  }
}

function NoteListPage() {
  const navigate =
    useNavigate();

  const {
    user,
    storeRevision,
  } = useAuth();

  const {
    showSnackbar,
  } = useSnackbar();

  const [
    notes,
    setNotes,
  ] = useState<Note[]>(() => {
    if (!user) {
      return [];
    }

    try {
      return getNotesForUser(
        user
      );
    } catch (error) {
      console.error(
        "Não foi possível carregar as notas.",
        error
      );

      return [];
    }
  });

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [storeFilter, setStoreFilter] = useState("");

  const [
    deletingNoteId,
    setDeletingNoteId,
  ] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void refreshNotes()
      .then(() => {
        if (active) setNotes(getNotesForUser(user));
      })
      .catch((error: unknown) => {
        console.error("Não foi possível atualizar as notas.", error);
        if (active) showSnackbar(error instanceof Error ? error.message : "Não foi possível atualizar as notas.", { severity: "error" });
      });
    return () => { active = false; };
  }, [storeRevision, user, showSnackbar]);

  const isAdministrator =
    user?.role ===
    "Administrador";

  const activeStores = getActiveStores();
  const effectiveStoreFilter = storeFilter !== "" && storeFilter !== "none" && !activeStores.some((store) => String(store.id) === storeFilter)
    ? ""
    : storeFilter;
  const selectedStore = activeStores.find((store) => String(store.id) === effectiveStoreFilter);
  const notesInSummary = selectedStore
    ? notes.filter((note) => note.storeId === selectedStore.id)
    : notes;
  const summaryTotalCents = notesInSummary.reduce((total, note) => total + (note.amount == null ? 0 : Math.round(note.amount * 100)), 0);
  const summaryNotesWithAmount = notesInSummary.filter((note) => note.amount != null).length;

  const filteredNotes =
    useMemo(() => {
      const normalizedSearch =
        searchTerm
          .trim()
          .toLocaleLowerCase(
            "pt-BR"
          );

      return notes.filter(
        (note) => {
          if (effectiveStoreFilter === "none" && note.storeId != null) return false;
          if (effectiveStoreFilter && effectiveStoreFilter !== "none" && String(note.storeId ?? "") !== effectiveStoreFilter) return false;
          const author =
            getUserById(
              note.authorUserId
            );

          const searchableText = [
            note.title,
            note.description,
            note.category,
            note.amount == null ? "" : String(note.amount),
            note.storeId == null ? "Sem loja" : (getStoreById(note.storeId)?.name ?? ""),
            author?.name ?? "",
          ]
            .join(" ")
            .toLocaleLowerCase(
              "pt-BR"
            );

          return !normalizedSearch || searchableText.includes(normalizedSearch);
        }
      );
    }, [
      notes,
      searchTerm,
      effectiveStoreFilter,
    ]);

  function reloadNotes(): void {
    if (!user) {
      setNotes([]);

      return;
    }

    try {
      setNotes(
        getNotesForUser(
          user
        )
      );
    } catch (error) {
      console.error(
        "Não foi possível atualizar a lista de notas.",
        error
      );

      showSnackbar(
        "Não foi possível atualizar as notas.",
        {
          severity:
            "error",
        }
      );
    }
  }

  function handleViewNote(
    noteId: number
  ): void {
    navigate(
      `/notes/${noteId}`
    );
  }

  function handleEditNote(
    noteId: number
  ): void {
    navigate(
      `/notes/${noteId}/edit`
    );
  }

  async function handleDeleteNote(
    note: Note
  ): Promise<void> {
    if (
      !user ||
      deletingNoteId !==
        null
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Deseja realmente excluir a nota "${note.title}"?\n\nTodos os arquivos anexados a esta nota também serão excluídos.`
      );

    if (!confirmed) {
      return;
    }

    setDeletingNoteId(
      note.id
    );

    try {
      const deleted =
        await deleteNote(
          note.id,
          user
        );

      if (!deleted) {
        throw new Error(
          "A nota não foi encontrada."
        );
      }

      reloadNotes();

      showSnackbar(
        "Nota e anexos excluídos com sucesso.",
        {
          severity:
            "success",
        }
      );
    } catch (error) {
      console.error(
        "Não foi possível excluir a nota.",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a nota.";

      showSnackbar(
        message,
        {
          severity:
            "error",
        }
      );
    } finally {
      setDeletingNoteId(
        null
      );
    }
  }

  return (
    <MainLayout title="Notas">
      <Stack spacing={3}>
        <Stack
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
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              fontWeight={700}
            >
              Notas
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              {isAdministrator
                ? "Visualize e gerencie todas as notas cadastradas no sistema."
                : "Visualize e gerencie as notas que você cadastrou."}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={
              <AddOutlined />
            }
            onClick={() =>
              navigate(
                "/notes/new"
              )
            }
          >
            Nova nota
          </Button>
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            p: 2,
          }}
        >
          <TextField
            value={
              searchTerm
            }
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="Pesquisar por título, descrição, categoria ou autor..."
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <SearchOutlined
                    color="action"
                    sx={{
                      mr: 1,
                    }}
                  />
                ),
              },
            }}
          />
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="notes-store-filter-label" htmlFor="notes-store-filter">Filtrar por loja</InputLabel>
            <Select id="notes-store-filter" labelId="notes-store-filter-label" value={effectiveStoreFilter} label="Filtrar por loja" onChange={(event) => setStoreFilter(event.target.value)}>
              <MenuItem value="">Todas as lojas</MenuItem>
              <MenuItem value="none">Sem loja</MenuItem>
              {activeStores.map((store) => <MenuItem key={store.id} value={String(store.id)}>{store.code} — {store.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Paper>

        {effectiveStoreFilter !== "none" && (
          <Paper variant="outlined" sx={{ p: 2.5, borderLeft: 4, borderLeftColor: "primary.main" }}>
            <Typography variant="body2" color="text.secondary">
              {selectedStore
                ? `Soma dos valores das notas - ${selectedStore.code} - ${selectedStore.name}`
                : "Soma dos valores das notas - Todas as lojas"}
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {(summaryTotalCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total de {notesInSummary.length} nota(s), independente da busca; {summaryNotesWithAmount} com valor informado.
            </Typography>
          </Paper>
        )}

        {notes.length ===
        0 ? (
          <Paper
            variant="outlined"
            sx={{
              p: 6,
              textAlign:
                "center",
            }}
          >
            <Stack
              spacing={2}
              alignItems="center"
            >
              <NoteOutlined
                color="disabled"
                sx={{
                  fontSize: 56,
                }}
              />

              <Typography
                variant="h6"
                fontWeight={700}
              >
                Nenhuma nota cadastrada
              </Typography>

              <Typography
                color="text.secondary"
              >
                {isAdministrator
                  ? "Ainda não existem notas cadastradas no sistema."
                  : "Você ainda não cadastrou nenhuma nota."}
              </Typography>

              <Button
                variant="contained"
                startIcon={
                  <AddOutlined />
                }
                onClick={() =>
                  navigate(
                    "/notes/new"
                  )
                }
              >
                Criar primeira nota
              </Button>
            </Stack>
          </Paper>
        ) : filteredNotes.length ===
          0 ? (
          <Alert severity="info">
            Nenhuma nota corresponde à pesquisa informada.
          </Alert>
        ) : (
          <Stack spacing={2}>
            {filteredNotes.map(
              (note) => {
                const author =
                  getUserById(
                    note.authorUserId
                  );
                const storeLabel = note.storeId == null
                  ? "Loja não informada"
                  : getStoreById(note.storeId)
                    ? `${getStoreById(note.storeId)?.code} — ${getStoreById(note.storeId)?.name}`
                    : `Loja #${note.storeId}`;
                const amountLabel = note.amount == null
                  ? "Valor não informado"
                  : note.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

                const canManage =
                  isAdministrator ||
                  note.authorUserId ===
                    user?.id;

                const isDeleting =
                  deletingNoteId ===
                  note.id;

                const anotherNoteIsDeleting =
                  deletingNoteId !==
                    null &&
                  !isDeleting;

                return (
                  <Paper
                    key={
                      note.id
                    }
                    variant="outlined"
                    sx={{
                      p: {
                        xs: 2,
                        md: 2.5,
                      },

                      transition:
                        "all .2s ease",

                      opacity:
                        isDeleting
                          ? 0.65
                          : 1,

                      "&:hover": {
                        boxShadow: 2,
                      },
                    }}
                  >
                    <Stack
                      direction={{
                        xs: "column",
                        md: "row",
                      }}
                      spacing={2}
                      justifyContent="space-between"
                    >
                      <Stack
                        spacing={1.25}
                        sx={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <Stack
                          direction={{
                            xs: "column",
                            sm: "row",
                          }}
                          spacing={1}
                          alignItems={{
                            xs: "flex-start",
                            sm: "center",
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight={700}
                          >
                            {note.title}
                          </Typography>

                          <Chip
                            size="small"
                            label={
                              note.category
                            }
                            color={getCategoryColor(
                              note.category
                            )}
                            variant="outlined"
                          />
                          <Chip size="small" label={storeLabel} variant="outlined" />
                          <Chip size="small" color={note.amount == null ? "default" : "success"} label={amountLabel} variant={note.amount == null ? "outlined" : "filled"} />
                          <Chip size="small" label={`Data: ${formatNoteDate(note.noteDate, note.createdAt)}`} variant="outlined" />
                        </Stack>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display:
                              "-webkit-box",

                            WebkitLineClamp:
                              2,

                            WebkitBoxOrient:
                              "vertical",

                            overflow:
                              "hidden",

                            whiteSpace:
                              "pre-wrap",
                          }}
                        >
                          {note.description}
                        </Typography>

                        <Stack
                          direction={{
                            xs: "column",
                            sm: "row",
                          }}
                          spacing={{
                            xs: 0.5,
                            sm: 2,
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Autor:{" "}
                            {author?.name ??
                              `Usuário #${note.authorUserId}`}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Atualizada em:{" "}
                            {formatDateTime(
                              note.updatedAt
                            )}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignSelf={{
                          xs: "flex-end",
                          md: "center",
                        }}
                      >
                        <Tooltip title="Visualizar nota">
                          <span>
                            <IconButton
                              color="primary"
                              disabled={
                                isDeleting ||
                                anotherNoteIsDeleting
                              }
                              onClick={() =>
                                handleViewNote(
                                  note.id
                                )
                              }
                              aria-label={`Visualizar nota ${note.title}`}
                            >
                              <VisibilityOutlined />
                            </IconButton>
                          </span>
                        </Tooltip>

                        {canManage && (
                          <>
                            <Tooltip title="Editar nota">
                              <span>
                                <IconButton
                                  color="warning"
                                  disabled={
                                    isDeleting ||
                                    anotherNoteIsDeleting
                                  }
                                  onClick={() =>
                                    handleEditNote(
                                      note.id
                                    )
                                  }
                                  aria-label={`Editar nota ${note.title}`}
                                >
                                  <EditOutlined />
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip title="Excluir nota">
                              <span>
                                <IconButton
                                  color="error"
                                  disabled={
                                    isDeleting ||
                                    anotherNoteIsDeleting
                                  }
                                  onClick={() =>
                                    void handleDeleteNote(
                                      note
                                    )
                                  }
                                  aria-label={`Excluir nota ${note.title}`}
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
                          </>
                        )}
                      </Stack>
                    </Stack>
                  </Paper>
                );
              }
            )}
          </Stack>
        )}
      </Stack>
    </MainLayout>
  );
}

export default NoteListPage;
