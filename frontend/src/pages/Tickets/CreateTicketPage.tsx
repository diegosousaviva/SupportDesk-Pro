import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";

import MainLayout from "../../components/layout/MainLayout";

import {
  useAuth,
} from "../../contexts/AuthContext";

import {
  useNotifications,
} from "../../contexts/NotificationContext";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

import {
  addInventoryHistoryEvent,
} from "../../services/inventoryHistoryService";

import {
  getInventoryItems,
} from "../../services/inventoryService";

import {
  getStoreById,
} from "../../services/storeService";

import {
  createTicketHistoryEntry,
} from "../../services/ticketHistoryService";

import {
  createTicket,
} from "../../services/ticketService";

import {
  getUsers,
} from "../../services/userService";

import type {
  Ticket,
} from "../../types/Ticket";

type TicketPriority =
  Ticket["priority"];

const UNASSIGNED_TECHNICIAN_VALUE =
  "unassigned";

const NO_EQUIPMENT_VALUE =
  "none";

function CreateTicketPage() {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();

  const {
    user,
  } = useAuth();

  const {
    addNotification,
  } = useNotifications();

  const {
    showSnackbar,
  } = useSnackbar();

  const [
    technicians,
  ] = useState(() =>
    getUsers()
      .filter(
        (currentUser) =>
          currentUser.role ===
            "Técnico" &&
          currentUser.status ===
            "Ativo"
      )
      .sort(
        (
          firstTechnician,
          secondTechnician
        ) =>
          firstTechnician.name.localeCompare(
            secondTechnician.name,
            "pt-BR"
          )
      )
  );

  const [
    inventoryItems,
  ] = useState(() =>
    getInventoryItems()
  );

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("");

  const [
    priority,
    setPriority,
  ] =
    useState<
      TicketPriority | ""
    >("");

  const [
    assignedTechnicianId,
    setAssignedTechnicianId,
  ] = useState(
    UNASSIGNED_TECHNICIAN_VALUE
  );

  const [
    selectedInventoryItemId,
    setSelectedInventoryItemId,
  ] = useState(() => {
    const inventoryItemIdParameter =
      searchParams.get(
        "inventoryItemId"
      );

    if (
      !inventoryItemIdParameter
    ) {
      return NO_EQUIPMENT_VALUE;
    }

    const inventoryItemId =
      Number(
        inventoryItemIdParameter
      );

    if (
      !Number.isInteger(
        inventoryItemId
      ) ||
      inventoryItemId <= 0
    ) {
      return NO_EQUIPMENT_VALUE;
    }

    const equipmentExists =
      inventoryItems.some(
        (inventoryItem) =>
          inventoryItem.id ===
          inventoryItemId
      );

    return equipmentExists
      ? String(
          inventoryItemId
        )
      : NO_EQUIPMENT_VALUE;
  });

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  function getNotificationSeverity():
    | "info"
    | "warning"
    | "error" {
    if (
      priority ===
      "Crítica"
    ) {
      return "error";
    }

    if (
      priority ===
      "Alta"
    ) {
      return "warning";
    }

    return "info";
  }

  function getInventoryItemLabel(
    inventoryItemId: number
  ): string {
    const inventoryItem =
      inventoryItems.find(
        (currentItem) =>
          currentItem.id ===
          inventoryItemId
      );

    if (!inventoryItem) {
      return `Equipamento #${inventoryItemId}`;
    }

    return `${inventoryItem.tag} — ${inventoryItem.description}`;
  }

  function registerEquipmentHistory(
    ticketId: number,
    ticketTitle: string,
    inventoryItemId: number
  ): void {
    const inventoryItem =
      inventoryItems.find(
        (currentItem) =>
          currentItem.id ===
          inventoryItemId
      );

    if (!inventoryItem) {
      return;
    }

    try {
      createTicketHistoryEntry({
        ticketId,

        eventType:
          "equipment_linked",

        description:
          `O equipamento ${inventoryItem.tag} — ${inventoryItem.description} foi vinculado ao chamado.`,
      });

      addInventoryHistoryEvent({
        inventoryItemId,

        type:
          "Chamado criado",

        title:
          `Chamado #${ticketId} criado`,

        description:
          `O chamado #${ticketId} — ${ticketTitle} foi criado e vinculado a este equipamento.`,

        performedByUserId:
          user?.id ?? null,
      });
    } catch (historyError) {
      console.error(
        "O chamado foi criado, mas não foi possível registrar todo o histórico da vinculação.",
        historyError
      );
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): void {
    event.preventDefault();

    setErrorMessage("");

    if (
      !title.trim() ||
      !category ||
      !priority ||
      !description.trim()
    ) {
      setErrorMessage(
        "Preencha todos os campos obrigatórios."
      );

      showSnackbar(
        "Preencha todos os campos obrigatórios.",
        {
          severity:
            "warning",
        }
      );

      return;
    }

    try {
      setIsSubmitting(
        true
      );

      const selectedTechnicianId =
        assignedTechnicianId ===
        UNASSIGNED_TECHNICIAN_VALUE
          ? null
          : Number(
              assignedTechnicianId
            );

      const inventoryItemId =
        selectedInventoryItemId ===
        NO_EQUIPMENT_VALUE
          ? null
          : Number(
              selectedInventoryItemId
            );

      if (
        selectedTechnicianId !==
          null &&
        (
          !Number.isInteger(
            selectedTechnicianId
          ) ||
          selectedTechnicianId <= 0
        )
      ) {
        throw new Error(
          "Selecione um técnico válido."
        );
      }

      if (
        inventoryItemId !==
          null &&
        (
          !Number.isInteger(
            inventoryItemId
          ) ||
          inventoryItemId <= 0
        )
      ) {
        throw new Error(
          "Selecione um equipamento válido."
        );
      }

      if (
        inventoryItemId !==
        null
      ) {
        const equipmentExists =
          inventoryItems.some(
            (inventoryItem) =>
              inventoryItem.id ===
              inventoryItemId
          );

        if (!equipmentExists) {
          throw new Error(
            "O equipamento selecionado não foi encontrado."
          );
        }
      }

      const createdTicket =
        createTicket({
          title:
            title.trim(),

          description:
            description.trim(),

          category,

          priority,

          status:
            "Aberto",

          requesterUserId:
            user?.id ?? 1,

          assignedTechnicianId:
            selectedTechnicianId,

          inventoryItemId,

          closedAt:
            null,
        });

      if (
        inventoryItemId !==
        null
      ) {
        registerEquipmentHistory(
          createdTicket.id,
          createdTicket.title,
          inventoryItemId
        );
      }

      addNotification({
        title:
          "Novo chamado criado",

        message:
          `O chamado #${createdTicket.id} — ${createdTicket.title} foi registrado com prioridade ${createdTicket.priority}.`,

        type:
          "ticket_created",

        severity:
          getNotificationSeverity(),

        read:
          false,

        ticketId:
          createdTicket.id,

        userId:
          user?.id ?? null,
      });

      if (
        selectedTechnicianId !==
        null
      ) {
        const technician =
          technicians.find(
            (
              currentTechnician
            ) =>
              currentTechnician.id ===
              selectedTechnicianId
          );

        addNotification({
          title:
            "Chamado atribuído",

          message:
            `O chamado #${createdTicket.id} foi atribuído ao técnico ${
              technician?.name ??
              `#${selectedTechnicianId}`
            }.`,

          type:
            "ticket_assigned",

          severity:
            "info",

          read:
            false,

          ticketId:
            createdTicket.id,

          userId:
            selectedTechnicianId,
        });
      }

      if (
        inventoryItemId !==
        null
      ) {
        addNotification({
          title:
            "Equipamento vinculado",

          message:
            `O equipamento ${getInventoryItemLabel(
              inventoryItemId
            )} foi vinculado ao chamado #${createdTicket.id}.`,

          type:
            "ticket_created",

          severity:
            "info",

          read:
            false,

          ticketId:
            createdTicket.id,

          userId:
            user?.id ?? null,
        });
      }

      showSnackbar(
        "Chamado criado com sucesso.",
        {
          severity:
            "success",
        }
      );

      navigate(
        `/tickets/${createdTicket.id}`
      );
    } catch (error) {
      console.error(
        "Não foi possível criar o chamado.",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível criar o chamado. Tente novamente.";

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

  const selectedInventoryItem =
    selectedInventoryItemId ===
    NO_EQUIPMENT_VALUE
      ? undefined
      : inventoryItems.find(
          (inventoryItem) =>
            inventoryItem.id ===
            Number(
              selectedInventoryItemId
            )
        );

  return (
    <MainLayout title="Abrir chamado">
      <Box
        sx={{
          maxWidth: 900,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: 1,
          }}
        >
          Abrir novo chamado
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mb: 3,
          }}
        >
          Preencha as informações abaixo para registrar
          uma nova solicitação.
        </Typography>

        {selectedInventoryItem && (
          <Alert
            severity="info"
            sx={{
              mb: 3,
            }}
          >
            Este chamado será criado para o equipamento{" "}
            <strong>
              {selectedInventoryItem.tag} —{" "}
              {selectedInventoryItem.description}
            </strong>
            .
          </Alert>
        )}

        {errorMessage && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
            }}
            onClose={() =>
              setErrorMessage(
                ""
              )
            }
          >
            {errorMessage}
          </Alert>
        )}

        <Paper
          sx={{
            p: {
              xs: 2.5,
              md: 4,
            },
          }}
        >
          <Box
            component="form"
            onSubmit={
              handleSubmit
            }
          >
            <Stack spacing={3}>
              <TextField
                label="Título do chamado"
                placeholder="Exemplo: Impressora não está funcionando"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target
                      .value
                  )
                }
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
                <InputLabel id="category-label">
                  Categoria
                </InputLabel>

                <Select
                  labelId="category-label"
                  label="Categoria"
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target
                        .value
                    )
                  }
                >
                  <MenuItem value="Hardware">
                    Hardware
                  </MenuItem>

                  <MenuItem value="Software">
                    Software
                  </MenuItem>

                  <MenuItem value="Rede">
                    Rede e internet
                  </MenuItem>

                  <MenuItem value="Acesso">
                    Acesso e permissões
                  </MenuItem>

                  <MenuItem value="Outros">
                    Outros
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                required
                disabled={
                  isSubmitting
                }
              >
                <InputLabel id="priority-label">
                  Prioridade
                </InputLabel>

                <Select
                  labelId="priority-label"
                  label="Prioridade"
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target
                        .value as TicketPriority
                    )
                  }
                >
                  <MenuItem value="Baixa">
                    Baixa
                  </MenuItem>

                  <MenuItem value="Média">
                    Média
                  </MenuItem>

                  <MenuItem value="Alta">
                    Alta
                  </MenuItem>

                  <MenuItem value="Crítica">
                    Crítica
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                disabled={
                  isSubmitting
                }
              >
                <InputLabel id="technician-label">
                  Técnico responsável
                </InputLabel>

                <Select
                  labelId="technician-label"
                  label="Técnico responsável"
                  value={
                    assignedTechnicianId
                  }
                  onChange={(event) =>
                    setAssignedTechnicianId(
                      event.target
                        .value
                    )
                  }
                >
                  <MenuItem
                    value={
                      UNASSIGNED_TECHNICIAN_VALUE
                    }
                  >
                    Não atribuído
                  </MenuItem>

                  {technicians.map(
                    (
                      technician
                    ) => (
                      <MenuItem
                        key={
                          technician.id
                        }
                        value={String(
                          technician.id
                        )}
                      >
                        {
                          technician.name
                        }
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>

              {technicians.length ===
                0 && (
                <Alert severity="info">
                  Não há técnicos ativos cadastrados. O
                  chamado será criado sem técnico
                  responsável.
                </Alert>
              )}

              <FormControl
                fullWidth
                disabled={
                  isSubmitting ||
                  inventoryItems.length ===
                    0
                }
              >
                <InputLabel id="inventory-item-label">
                  Equipamento
                </InputLabel>

                <Select
                  labelId="inventory-item-label"
                  label="Equipamento"
                  value={
                    selectedInventoryItemId
                  }
                  onChange={(event) =>
                    setSelectedInventoryItemId(
                      event.target
                        .value
                    )
                  }
                  renderValue={(
                    selectedValue
                  ) => {
                    if (
                      selectedValue ===
                      NO_EQUIPMENT_VALUE
                    ) {
                      return "Nenhum equipamento";
                    }

                    return getInventoryItemLabel(
                      Number(
                        selectedValue
                      )
                    );
                  }}
                >
                  <MenuItem
                    value={
                      NO_EQUIPMENT_VALUE
                    }
                  >
                    <Stack>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                      >
                        Nenhum equipamento
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Criar chamado sem vínculo com o
                        inventário
                      </Typography>
                    </Stack>
                  </MenuItem>

                  {inventoryItems.map(
                    (
                      inventoryItem
                    ) => {
                      const store =
                        getStoreById(
                          inventoryItem.storeId
                        );

                      return (
                        <MenuItem
                          key={
                            inventoryItem.id
                          }
                          value={String(
                            inventoryItem.id
                          )}
                        >
                          <Stack
                            spacing={0.25}
                            sx={{
                              py: 0.5,
                            }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={600}
                            >
                              {
                                inventoryItem.description
                              }
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Etiqueta:{" "}
                              {
                                inventoryItem.tag
                              }
                              {" • "}
                              {store
                                ? `${store.code} — ${store.name}`
                                : "Loja não encontrada"}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Situação:{" "}
                              {
                                inventoryItem.status
                              }
                              {" • "}
                              Estado:{" "}
                              {
                                inventoryItem.condition
                              }
                            </Typography>
                          </Stack>
                        </MenuItem>
                      );
                    }
                  )}
                </Select>

                <FormHelperText>
                  Opcional. Selecione o equipamento relacionado
                  ao chamado.
                </FormHelperText>
              </FormControl>

              {inventoryItems.length ===
                0 && (
                <Alert severity="info">
                  Não há equipamentos cadastrados no inventário.
                  O chamado será criado sem equipamento
                  vinculado.
                </Alert>
              )}

              <TextField
                label="Descrição"
                placeholder="Descreva o problema com o máximo de detalhes possível"
                value={
                  description
                }
                onChange={(event) =>
                  setDescription(
                    event.target
                      .value
                  )
                }
                multiline
                rows={6}
                required
                fullWidth
                disabled={
                  isSubmitting
                }
              />

              <Box
                sx={{
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={
                    <SaveIcon />
                  }
                  loading={
                    isSubmitting
                  }
                  disabled={
                    isSubmitting
                  }
                >
                  {isSubmitting
                    ? "Salvando..."
                    : "Salvar chamado"}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </MainLayout>
  );
}

export default CreateTicketPage;