import {
  Alert,
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

import {
  ArrowBack,
  Save,
} from "@mui/icons-material";

import {
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Permissions,
} from "../../auth/permissions";

import {
  canEditTicket,
} from "../../auth/ticketAuthorization";

import MainLayout from "../../components/layout/MainLayout";

import {
  useAuth,
} from "../../contexts/AuthContext";

import {
  useLanguage,
} from "../../contexts/LanguageContext";

import {
  useNotifications,
} from "../../contexts/NotificationContext";

import {
  usePermissions,
} from "../../hooks/usePermissions";

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
  getActiveStores,
  getStoreById,
} from "../../services/storeService";

import {
  createTicketHistoryEntry,
} from "../../services/ticketHistoryService";

import {
  getTicketById,
  updateTicket,
} from "../../services/ticketService";

import {
  getUsers,
} from "../../services/userService";

import type {
  Ticket,
} from "../../types/Ticket";

type TicketPriority =
  Ticket["priority"];

type TicketStatus =
  Ticket["status"];

const UNASSIGNED_TECHNICIAN_VALUE =
  "unassigned";

const NO_STORE_VALUE =
  "none";

const NO_EQUIPMENT_VALUE =
  "none";

const MINIMUM_TITLE_LENGTH =
  3;

const MAXIMUM_TITLE_LENGTH =
  120;

const MINIMUM_DESCRIPTION_LENGTH =
  10;

const MAXIMUM_DESCRIPTION_LENGTH =
  2000;

const MAXIMUM_CATEGORY_LENGTH =
  80;

export default function EditTicketPage() {
  const navigate =
    useNavigate();

  const {
    id,
  } = useParams();

  const {
    user,
  } = useAuth();

  const {
    language,
    t,
  } = useLanguage();

  const {
    can,
  } = usePermissions();

  const {
    showSnackbar,
  } = useSnackbar();

  const {
    addNotification,
    removeSlaNotificationsByTicket,
  } = useNotifications();

  const ticketId =
    Number(id);

  const ticket =
    getTicketById(
      ticketId
    );

  const technicians =
    getUsers().filter(
      (currentUser) =>
        currentUser.role ===
          "Técnico" &&
        (
          currentUser.status ===
            "Ativo" ||
          currentUser.id ===
            ticket?.assignedTechnicianId
        )
    );

  const inventoryItems =
    getInventoryItems();

  const activeStores =
    getActiveStores();

  const currentTicketStore =
    ticket?.storeId
      ? getStoreById(
          ticket.storeId
        )
      : undefined;

  const stores =
    currentTicketStore &&
    !activeStores.some(
      (store) =>
        store.id ===
        currentTicketStore.id
    )
      ? [
          ...activeStores,
          currentTicketStore,
        ]
      : activeStores;

  const [
    title,
    setTitle,
  ] = useState(
    ticket?.title ?? ""
  );

  const [
    description,
    setDescription,
  ] = useState(
    ticket?.description ?? ""
  );

  const [
    category,
    setCategory,
  ] = useState(
    ticket?.category ?? ""
  );

  const [
    priority,
    setPriority,
  ] =
    useState<TicketPriority>(
      ticket?.priority ??
        "Baixa"
    );

  const [
    status,
    setStatus,
  ] =
    useState<TicketStatus>(
      ticket?.status ??
        "Aberto"
    );

  const [
    selectedStoreId,
    setSelectedStoreId,
  ] = useState(
    ticket?.storeId ===
      null ||
      ticket?.storeId ===
        undefined
      ? NO_STORE_VALUE
      : String(
          ticket.storeId
        )
  );

  const [
    assignedTechnicianId,
    setAssignedTechnicianId,
  ] = useState(
    ticket?.assignedTechnicianId ===
      null ||
      ticket?.assignedTechnicianId ===
        undefined
      ? UNASSIGNED_TECHNICIAN_VALUE
      : String(
          ticket.assignedTechnicianId
        )
  );

  const [
    selectedInventoryItemId,
    setSelectedInventoryItemId,
  ] = useState(
    ticket?.inventoryItemId ===
      null ||
      ticket?.inventoryItemId ===
        undefined
      ? NO_EQUIPMENT_VALUE
      : String(
          ticket.inventoryItemId
        )
  );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  if (!ticket) {
    return (
      <MainLayout title="Editar Chamado">
        <Alert severity="error">
          Chamado não encontrado.
        </Alert>

        <Button
          sx={{
            mt: 2,
          }}
          variant="outlined"
          startIcon={
            <ArrowBack />
          }
          onClick={() =>
            navigate(
              "/tickets"
            )
          }
        >
          Voltar para chamados
        </Button>
      </MainLayout>
    );
  }

  const currentTicket: Ticket =
    ticket;

  const mayEditTicket =
    canEditTicket(
      user,
      currentTicket,
      can
    );

  const mayAssignTechnician =
    can(
      Permissions.tickets.assign
    );

  const mayUpdateStatus =
    can(
      Permissions.tickets.updateStatus
    );

  const mayEditAdministrativeFields =
    can(
      Permissions.tickets.edit
    );

  if (!mayEditTicket) {
    return (
      <MainLayout title="Editar Chamado">
        <Alert severity="warning">
          Você não possui permissão para editar este
          chamado.
        </Alert>

        <Button
          sx={{
            mt: 2,
          }}
          variant="outlined"
          startIcon={
            <ArrowBack />
          }
          onClick={() =>
            navigate(
              "/tickets"
            )
          }
        >
          Voltar para chamados
        </Button>
      </MainLayout>
    );
  }

  const currentTicketId =
    currentTicket.id;

  const ticketDetailsPath =
    `/tickets/${currentTicketId}`;

  const normalizedTitle =
    title.trim();

  const normalizedDescription =
    description.trim();

  const normalizedCategory =
    category.trim();

  const titleTooShort =
    normalizedTitle.length >
      0 &&
    normalizedTitle.length <
      MINIMUM_TITLE_LENGTH;

  const descriptionTooShort =
    normalizedDescription.length >
      0 &&
    normalizedDescription.length <
      MINIMUM_DESCRIPTION_LENGTH;

  const selectedStoreNumber =
    selectedStoreId ===
    NO_STORE_VALUE
      ? null
      : Number(
          selectedStoreId
        );

  const selectedStoreExists =
    selectedStoreNumber ===
      null ||
    stores.some(
      (store) =>
        store.id ===
        selectedStoreNumber
    );

  const assignedTechnicianNumber =
    assignedTechnicianId ===
    UNASSIGNED_TECHNICIAN_VALUE
      ? null
      : Number(
          assignedTechnicianId
        );

  const assignedTechnicianExists =
    assignedTechnicianNumber ===
      null ||
    technicians.some(
      (technician) =>
        technician.id ===
        assignedTechnicianNumber
    );

  const selectedInventoryItemNumber =
    selectedInventoryItemId ===
    NO_EQUIPMENT_VALUE
      ? null
      : Number(
          selectedInventoryItemId
        );

  const selectedInventoryItemExists =
    selectedInventoryItemNumber ===
      null ||
    inventoryItems.some(
      (inventoryItem) =>
        inventoryItem.id ===
        selectedInventoryItemNumber
    );

  function handleBack():
    void {
    if (isSaving) {
      return;
    }

    navigate(
      ticketDetailsPath
    );
  }

  function getTranslatedStatus(
    ticketStatus:
      TicketStatus
  ): string {
    switch (
      ticketStatus
    ) {
      case "Aberto":
        return t(
          "status.open"
        );

      case "Em andamento":
        return t(
          "status.inProgress"
        );

      case "Resolvido":
        return t(
          "status.resolved"
        );

      default:
        return ticketStatus;
    }
  }

  function getTechnicianName(
    technicianId:
      number | null
  ): string {
    if (
      technicianId ===
      null
    ) {
      return t(
        "technician.unassigned"
      );
    }

    const technician =
      getUsers().find(
        (currentUser) =>
          currentUser.id ===
          technicianId
      );

    if (
      technician
    ) {
      return technician.name;
    }

    return `${t(
      "technician.notFound"
    )} (#${technicianId})`;
  }

  function getInventoryItemLabel(
    inventoryItemId:
      number
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

  function registerEquipmentChangeHistory(
    previousInventoryItemId:
      number | null,
    newInventoryItemId:
      number | null
  ): void {
    if (
      previousInventoryItemId ===
      newInventoryItemId
    ) {
      return;
    }

    try {
      if (
        previousInventoryItemId !==
        null
      ) {
        const previousEquipment =
          inventoryItems.find(
            (inventoryItem) =>
              inventoryItem.id ===
              previousInventoryItemId
          );

        if (previousEquipment) {
          addInventoryHistoryEvent({
            inventoryItemId:
              previousInventoryItemId,

            type:
              "Observação",

            title:
              `Chamado #${currentTicketId} desvinculado`,

            description:
              `O chamado #${currentTicketId} — ${normalizedTitle} deixou de estar vinculado a este equipamento.`,

            performedByUserId:
              user?.id ??
              null,
          });
        }
      }

      if (
        newInventoryItemId !==
        null
      ) {
        const newEquipment =
          inventoryItems.find(
            (inventoryItem) =>
              inventoryItem.id ===
              newInventoryItemId
          );

        if (newEquipment) {
          addInventoryHistoryEvent({
            inventoryItemId:
              newInventoryItemId,

            type:
              "Chamado vinculado",

            title:
              `Chamado #${currentTicketId} vinculado`,

            description:
              `O chamado #${currentTicketId} — ${normalizedTitle} foi vinculado a este equipamento.`,

            performedByUserId:
              user?.id ??
              null,
          });
        }
      }

      if (
        previousInventoryItemId ===
          null &&
        newInventoryItemId !==
          null
      ) {
        createTicketHistoryEntry({
          ticketId:
            currentTicketId,

          eventType:
            "equipment_linked",

          description:
            `O equipamento ${getInventoryItemLabel(
              newInventoryItemId
            )} foi vinculado ao chamado.`,
        });

        return;
      }

      if (
        previousInventoryItemId !==
          null &&
        newInventoryItemId ===
          null
      ) {
        createTicketHistoryEntry({
          ticketId:
            currentTicketId,

          eventType:
            "equipment_linked",

          description:
            `O equipamento ${getInventoryItemLabel(
              previousInventoryItemId
            )} foi desvinculado do chamado.`,
        });

        return;
      }

      if (
        previousInventoryItemId !==
          null &&
        newInventoryItemId !==
          null
      ) {
        createTicketHistoryEntry({
          ticketId:
            currentTicketId,

          eventType:
            "equipment_linked",

          description:
            `O equipamento do chamado foi alterado de ${getInventoryItemLabel(
              previousInventoryItemId
            )} para ${getInventoryItemLabel(
              newInventoryItemId
            )}.`,
        });
      }
    } catch (historyError) {
      console.error(
        "O chamado foi atualizado, mas não foi possível registrar todo o histórico da alteração do equipamento.",
        historyError
      );
    }
  }

  function showValidationMessage(
    message: string
  ): void {
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
  }

  function handleSave():
    void {
    if (
      isSaving ||
      !mayEditTicket
    ) {
      return;
    }

    setErrorMessage("");

    if (
      !normalizedTitle ||
      !normalizedCategory ||
      !normalizedDescription
    ) {
      showValidationMessage(
        "Preencha o título, a categoria e a descrição do chamado."
      );

      return;
    }

    if (
      normalizedTitle.length <
      MINIMUM_TITLE_LENGTH
    ) {
      showValidationMessage(
        `O título deve possuir pelo menos ${MINIMUM_TITLE_LENGTH} caracteres.`
      );

      return;
    }

    if (
      normalizedTitle.length >
      MAXIMUM_TITLE_LENGTH
    ) {
      showValidationMessage(
        `O título deve possuir no máximo ${MAXIMUM_TITLE_LENGTH} caracteres.`
      );

      return;
    }

    if (
      normalizedCategory.length >
      MAXIMUM_CATEGORY_LENGTH
    ) {
      showValidationMessage(
        `A categoria deve possuir no máximo ${MAXIMUM_CATEGORY_LENGTH} caracteres.`
      );

      return;
    }

    if (
      normalizedDescription.length <
      MINIMUM_DESCRIPTION_LENGTH
    ) {
      showValidationMessage(
        `A descrição deve possuir pelo menos ${MINIMUM_DESCRIPTION_LENGTH} caracteres.`
      );

      return;
    }

    if (
      normalizedDescription.length >
      MAXIMUM_DESCRIPTION_LENGTH
    ) {
      showValidationMessage(
        `A descrição deve possuir no máximo ${MAXIMUM_DESCRIPTION_LENGTH.toLocaleString(
          "pt-BR"
        )} caracteres.`
      );

      return;
    }

    if (
      mayEditAdministrativeFields &&
      selectedStoreNumber !==
        null &&
      (
        !Number.isInteger(
          selectedStoreNumber
        ) ||
        selectedStoreNumber <=
          0
      )
    ) {
      showValidationMessage(
        "Selecione uma loja solicitante válida."
      );

      return;
    }

    if (
      mayEditAdministrativeFields &&
      selectedStoreNumber !==
        null &&
      !selectedStoreExists
    ) {
      showValidationMessage(
        "A loja solicitante selecionada não foi encontrada."
      );

      return;
    }

    if (
      mayAssignTechnician &&
      assignedTechnicianNumber !==
        null &&
      (
        !Number.isInteger(
          assignedTechnicianNumber
        ) ||
        assignedTechnicianNumber <=
          0
      )
    ) {
      showValidationMessage(
        "Selecione um técnico responsável válido."
      );

      return;
    }

    if (
      mayAssignTechnician &&
      assignedTechnicianNumber !==
        null &&
      !assignedTechnicianExists
    ) {
      showValidationMessage(
        "O técnico responsável selecionado não foi encontrado."
      );

      return;
    }

    if (
      mayEditAdministrativeFields &&
      selectedInventoryItemNumber !==
        null &&
      (
        !Number.isInteger(
          selectedInventoryItemNumber
        ) ||
        selectedInventoryItemNumber <=
          0
      )
    ) {
      showValidationMessage(
        "Selecione um equipamento válido."
      );

      return;
    }

    if (
      mayEditAdministrativeFields &&
      selectedInventoryItemNumber !==
        null &&
      !selectedInventoryItemExists
    ) {
      showValidationMessage(
        "O equipamento selecionado não foi encontrado."
      );

      return;
    }

    try {
      setIsSaving(
        true
      );

      const previousStatus =
        currentTicket.status;

      const previousTechnicianId =
        currentTicket.assignedTechnicianId;

      const previousInventoryItemId =
        currentTicket.inventoryItemId;

      const updatedTicket =
        updateTicket(
          currentTicketId,
          {
            title:
              normalizedTitle,

            description:
              normalizedDescription,

            category:
              normalizedCategory,

            priority,

            status:
              mayUpdateStatus &&
              mayEditAdministrativeFields
                ? status
                : currentTicket.status,

            storeId:
              mayEditAdministrativeFields
                ? selectedStoreNumber
                : currentTicket.storeId,

            assignedTechnicianId:
              mayAssignTechnician &&
              mayEditAdministrativeFields
                ? assignedTechnicianNumber
                : currentTicket.assignedTechnicianId,

            inventoryItemId:
              mayEditAdministrativeFields
                ? selectedInventoryItemNumber
                : currentTicket.inventoryItemId,
          }
        );

      if (!updatedTicket) {
        throw new Error(
          "O serviço não retornou o chamado atualizado."
        );
      }

      const statusChanged =
        previousStatus !==
        updatedTicket.status;

      const technicianChanged =
        previousTechnicianId !==
        updatedTicket.assignedTechnicianId;

      const equipmentChanged =
        previousInventoryItemId !==
        updatedTicket.inventoryItemId;

      if (
        equipmentChanged
      ) {
        registerEquipmentChangeHistory(
          previousInventoryItemId,
          updatedTicket.inventoryItemId
        );

        if (
          updatedTicket.inventoryItemId !==
          null
        ) {
          addNotification({
            title:
              "Equipamento vinculado",

            message:
              `O equipamento ${getInventoryItemLabel(
                updatedTicket.inventoryItemId
              )} foi vinculado ao chamado #${updatedTicket.id}.`,

            type:
              "ticket_created",

            severity:
              "info",

            read:
              false,

            ticketId:
              updatedTicket.id,

            userId:
              user?.id ??
              null,
          });
        }
      }

      if (
        statusChanged &&
        (
          updatedTicket.status ===
            "Resolvido" ||
          previousStatus ===
            "Resolvido"
        )
      ) {
        removeSlaNotificationsByTicket(
          updatedTicket.id
        );
      }

      if (statusChanged) {
        const translatedPreviousStatus =
          getTranslatedStatus(
            previousStatus
          );

        const translatedNewStatus =
          getTranslatedStatus(
            updatedTicket.status
          );

        addNotification({
          title:
            updatedTicket.status ===
            "Resolvido"
              ? t(
                  "notification.ticketResolved.title"
                )
              : previousStatus ===
                "Resolvido"
                ? t(
                    "notification.ticketReopened.title"
                  )
                : t(
                    "notification.ticketStatusUpdated.title"
                  ),

          message:
            language ===
            "en-US"
              ? updatedTicket.status ===
                "Resolvido"
                ? `Ticket #${updatedTicket.id} — ${updatedTicket.title} was resolved. Pending SLA alerts were removed.`
                : previousStatus ===
                  "Resolvido"
                  ? `Ticket #${updatedTicket.id} — ${updatedTicket.title} was reopened. SLA monitoring will resume for this ticket.`
                  : `Ticket #${updatedTicket.id} status changed from "${translatedPreviousStatus}" to "${translatedNewStatus}".`
              : updatedTicket.status ===
                "Resolvido"
                ? `O chamado #${updatedTicket.id} — ${updatedTicket.title} foi resolvido. Os alertas de SLA pendentes foram removidos.`
                : previousStatus ===
                  "Resolvido"
                  ? `O chamado #${updatedTicket.id} — ${updatedTicket.title} foi reaberto. O monitor de SLA voltará a acompanhar este chamado.`
                  : `O chamado #${updatedTicket.id} teve o status alterado de "${translatedPreviousStatus}" para "${translatedNewStatus}".`,

          type:
            updatedTicket.status ===
            "Resolvido"
              ? "ticket_resolved"
              : "status_changed",

          severity:
            updatedTicket.status ===
            "Resolvido"
              ? "success"
              : previousStatus ===
                "Resolvido"
                ? "warning"
                : "info",

          read:
            false,

          ticketId:
            updatedTicket.id,

          userId:
            updatedTicket.assignedTechnicianId,
        });
      }

      if (technicianChanged) {
        const previousTechnicianName =
          getTechnicianName(
            previousTechnicianId
          );

        const newTechnicianName =
          getTechnicianName(
            updatedTicket.assignedTechnicianId
          );

        addNotification({
          title:
            updatedTicket.assignedTechnicianId ===
            null
              ? t(
                  "notification.ticketUnassigned.title"
                )
              : previousTechnicianId ===
                null
                ? t(
                    "notification.ticketAssigned.title"
                  )
                : t(
                    "notification.technicianChanged.title"
                  ),

          message:
            language ===
            "en-US"
              ? updatedTicket.assignedTechnicianId ===
                null
                ? `Ticket #${updatedTicket.id} is no longer assigned to ${previousTechnicianName}.`
                : previousTechnicianId ===
                  null
                  ? `Ticket #${updatedTicket.id} was assigned to technician ${newTechnicianName}.`
                  : `Ticket #${updatedTicket.id} was transferred from ${previousTechnicianName} to ${newTechnicianName}.`
              : updatedTicket.assignedTechnicianId ===
                null
                ? `O chamado #${updatedTicket.id} deixou de estar atribuído a ${previousTechnicianName}.`
                : previousTechnicianId ===
                  null
                  ? `O chamado #${updatedTicket.id} foi atribuído ao técnico ${newTechnicianName}.`
                  : `O chamado #${updatedTicket.id} foi transferido de ${previousTechnicianName} para ${newTechnicianName}.`,

          type:
            "ticket_assigned",

          severity:
            updatedTicket.assignedTechnicianId ===
            null
              ? "warning"
              : "info",

          read:
            false,

          ticketId:
            updatedTicket.id,

          userId:
            updatedTicket.assignedTechnicianId,
        });
      }

      showSnackbar(
        "Chamado atualizado com sucesso.",
        {
          severity:
            "success",
        }
      );

      navigate(
        ticketDetailsPath
      );
    } catch (error) {
      console.error(
        "Não foi possível atualizar o chamado.",
        error
      );

      const failureMessage =
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o chamado. Tente novamente.";

      setErrorMessage(
        failureMessage
      );

      showSnackbar(
        failureMessage,
        {
          severity:
            "error",
        }
      );
    } finally {
      setIsSaving(
        false
      );
    }
  }

  return (
    <MainLayout title="Editar Chamado">
      <Stack spacing={2}>
        <Button
          variant="text"
          startIcon={
            <ArrowBack />
          }
          onClick={
            handleBack
          }
          disabled={
            isSaving
          }
          sx={{
            alignSelf:
              "flex-start",
          }}
        >
          Voltar aos detalhes
        </Button>

        {errorMessage && (
          <Alert
            severity="error"
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
          <Stack spacing={3}>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight:
                  700,
              }}
            >
              Editar chamado #
              {currentTicketId}
            </Typography>

            <TextField
              label="Título"
              value={
                title
              }
              onChange={(event) =>
                setTitle(
                  event.target
                    .value
                )
              }
              fullWidth
              required
              disabled={
                isSaving
              }
              error={
                titleTooShort
              }
              helperText={
                titleTooShort
                  ? `Digite pelo menos ${MINIMUM_TITLE_LENGTH} caracteres.`
                  : `${title.length}/${MAXIMUM_TITLE_LENGTH} caracteres`
              }
              slotProps={{
                htmlInput: {
                  maxLength:
                    MAXIMUM_TITLE_LENGTH,
                },
              }}
            />

            <TextField
              label="Categoria"
              value={
                category
              }
              onChange={(event) =>
                setCategory(
                  event.target
                    .value
                )
              }
              fullWidth
              required
              disabled={
                isSaving
              }
              helperText={`${category.length}/${MAXIMUM_CATEGORY_LENGTH} caracteres`}
              slotProps={{
                htmlInput: {
                  maxLength:
                    MAXIMUM_CATEGORY_LENGTH,
                },
              }}
            />

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
              fullWidth
              required
              disabled={
                isSaving
              }
              error={
                descriptionTooShort
              }
              helperText={
                descriptionTooShort
                  ? `Digite pelo menos ${MINIMUM_DESCRIPTION_LENGTH} caracteres.`
                  : `${description.length}/${MAXIMUM_DESCRIPTION_LENGTH.toLocaleString(
                      "pt-BR"
                    )} caracteres`
              }
              slotProps={{
                htmlInput: {
                  maxLength:
                    MAXIMUM_DESCRIPTION_LENGTH,
                },
              }}
            />

            <TextField
              select
              label="Prioridade"
              value={
                priority
              }
              onChange={(event) =>
                setPriority(
                  event.target
                    .value as TicketPriority
                )
              }
              fullWidth
              disabled={
                isSaving
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
            </TextField>

            {mayEditAdministrativeFields && (
              <TextField
                select
                label="Loja solicitante"
                value={
                  selectedStoreId
                }
                onChange={(event) =>
                  setSelectedStoreId(
                    event.target
                      .value
                  )
                }
                helperText={
                  stores.length ===
                    0
                    ? "Não há lojas ativas cadastradas."
                    : "Selecione a loja para a qual o chamado está sendo atendido."
                }
                fullWidth
                disabled={
                  isSaving
                }
              >
                <MenuItem
                  value={
                    NO_STORE_VALUE
                  }
                >
                  Não informada
                </MenuItem>

                {stores.map(
                  (
                    store
                  ) => (
                    <MenuItem
                      key={
                        store.id
                      }
                      value={String(
                        store.id
                      )}
                    >
                      {store.code} — {store.name}
                      {store.status ===
                      "Inativa"
                        ? " — Inativa"
                        : ""}
                    </MenuItem>
                  )
                )}
              </TextField>
            )}

            {mayUpdateStatus &&
              mayEditAdministrativeFields && (
                <TextField
                  select
                  label="Status"
                  value={
                    status
                  }
                  onChange={(event) =>
                    setStatus(
                      event.target
                        .value as TicketStatus
                    )
                  }
                  fullWidth
                  disabled={
                    isSaving
                  }
                >
                  <MenuItem value="Aberto">
                    Aberto
                  </MenuItem>

                  <MenuItem value="Em andamento">
                    Em andamento
                  </MenuItem>

                  <MenuItem value="Resolvido">
                    Resolvido
                  </MenuItem>
                </TextField>
              )}

            {mayAssignTechnician &&
              mayEditAdministrativeFields && (
                <TextField
                  select
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
                  helperText={
                    technicians.length ===
                      0
                      ? "Não há técnicos ativos cadastrados."
                      : "Selecione o técnico responsável pelo chamado."
                  }
                  fullWidth
                  disabled={
                    isSaving
                  }
                >
                  <MenuItem
                    value={
                      UNASSIGNED_TECHNICIAN_VALUE
                    }
                  >
                    Não atribuído
                  </MenuItem>

                  {!assignedTechnicianExists &&
                    assignedTechnicianNumber !==
                      null && (
                      <MenuItem
                        value={String(
                          assignedTechnicianNumber
                        )}
                        disabled
                      >
                        Técnico não encontrado (#
                        {assignedTechnicianNumber})
                      </MenuItem>
                    )}

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
                        {technician.status ===
                        "Inativo"
                          ? " — Inativo"
                          : ""}
                      </MenuItem>
                    )
                  )}
                </TextField>
              )}

            {mayEditAdministrativeFields && (
              <>
                <FormControl
                  fullWidth
                  disabled={
                    isSaving ||
                    inventoryItems.length ===
                      0
                  }
                >
                  <InputLabel id="edit-ticket-inventory-item-label">
                    Equipamento
                  </InputLabel>

                  <Select
                    labelId="edit-ticket-inventory-item-label"
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
                          Remover vínculo com o inventário
                        </Typography>
                      </Stack>
                    </MenuItem>

                    {inventoryItems.map(
                      (
                        inventoryItem
                      ) => {
                        const equipmentStore =
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
                                {equipmentStore
                                  ? `${equipmentStore.code} — ${equipmentStore.name}`
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
                    ao chamado ou escolha Nenhum equipamento para
                    remover o vínculo atual.
                  </FormHelperText>
                </FormControl>

                {inventoryItems.length ===
                  0 && (
                  <Alert severity="info">
                    Não há equipamentos cadastrados no inventário.
                  </Alert>
                )}
              </>
            )}

            <Stack
              direction={{
                xs:
                  "column",
                sm:
                  "row",
              }}
              spacing={2}
            >
              <Button
                variant="outlined"
                startIcon={
                  <ArrowBack />
                }
                onClick={
                  handleBack
                }
                disabled={
                  isSaving
                }
              >
                Cancelar
              </Button>

              <Button
                variant="contained"
                startIcon={
                  <Save />
                }
                onClick={
                  handleSave
                }
                loading={
                  isSaving
                }
                disabled={
                  isSaving ||
                  !normalizedTitle ||
                  !normalizedCategory ||
                  !normalizedDescription
                }
              >
                {isSaving
                  ? "Salvando..."
                  : "Salvar alterações"}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </MainLayout>
  );
}