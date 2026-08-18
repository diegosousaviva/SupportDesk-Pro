import {
  Alert,
  Button,
  MenuItem,
  Paper,
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

import MainLayout from "../../components/layout/MainLayout";

import {
  useNotifications,
} from "../../contexts/NotificationContext";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

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
    showSnackbar,
  } = useSnackbar();

  const {
    addNotification,
    removeSlaNotificationsByTicket,
  } = useNotifications();

  const ticketId =
    Number(
      id
    );

  const ticket =
    getTicketById(
      ticketId
    );

  const technicians =
    getUsers().filter(
      (user) =>
        user.role ===
          "Técnico" &&
        (
          user.status ===
            "Ativo" ||
          user.id ===
            ticket?.assignedTechnicianId
        )
    );

  const [
    title,
    setTitle,
  ] = useState(
    ticket?.title ??
      ""
  );

  const [
    description,
    setDescription,
  ] = useState(
    ticket?.description ??
      ""
  );

  const [
    category,
    setCategory,
  ] = useState(
    ticket?.category ??
      ""
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

  const currentTicketId =
    ticket.id;

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

  function handleBack():
    void {
    if (isSaving) {
      return;
    }

    navigate(
      ticketDetailsPath
    );
  }

  function getTechnicianName(
    technicianId:
      number | null
  ): string {
    if (
      technicianId ===
      null
    ) {
      return "Não atribuído";
    }

    const technician =
      getUsers().find(
        (user) =>
          user.id ===
          technicianId
      );

    return (
      technician?.name ??
      `Técnico não encontrado (#${technicianId})`
    );
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
    if (isSaving) {
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
      assignedTechnicianNumber !==
        null &&
      !assignedTechnicianExists
    ) {
      showValidationMessage(
        "O técnico responsável selecionado não foi encontrado."
      );

      return;
    }

    try {
      setIsSaving(
        true
      );

      const previousStatus =
        ticket.status;

      const previousTechnicianId =
        ticket.assignedTechnicianId;

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

            status,

            assignedTechnicianId:
              assignedTechnicianNumber,
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
        addNotification({
          title:
            updatedTicket.status ===
            "Resolvido"
              ? "Chamado resolvido"
              : previousStatus ===
                "Resolvido"
                ? "Chamado reaberto"
                : "Status do chamado atualizado",

          message:
            updatedTicket.status ===
            "Resolvido"
              ? `O chamado #${updatedTicket.id} — ${updatedTicket.title} foi resolvido. Os alertas de SLA pendentes foram removidos.`
              : previousStatus ===
                "Resolvido"
                ? `O chamado #${updatedTicket.id} — ${updatedTicket.title} foi reaberto. O monitor de SLA voltará a acompanhar este chamado.`
                : `O chamado #${updatedTicket.id} teve o status alterado de "${previousStatus}" para "${updatedTicket.status}".`,

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
              ? "Chamado sem responsável"
              : previousTechnicianId ===
                null
                ? "Chamado atribuído"
                : "Técnico responsável alterado",

          message:
            updatedTicket.assignedTechnicianId ===
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