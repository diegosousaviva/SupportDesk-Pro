import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
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
  canDeleteTicket,
  canEditTicket,
  canViewTicket,
} from "../../auth/ticketAuthorization";

import MainLayout from "../../components/layout/MainLayout";
import SlaProgress from "../../components/sla/SlaProgress";
import TicketActions from "../../components/tickets/TicketActions";
import TicketDescriptionCard from "../../components/tickets/TicketDescriptionCard";
import TicketEquipmentCard from "../../components/tickets/TicketEquipmentCard";
import TicketHeader from "../../components/tickets/TicketHeader";
import TicketInfoCard from "../../components/tickets/TicketInfoCard";
import TicketTimeline from "../../components/tickets/TicketTimeline";

import {
  useAuth,
} from "../../contexts/AuthContext";

import {
  usePermissions,
} from "../../hooks/usePermissions";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

import {
  createTicketComment,
  deleteTicketComments,
} from "../../services/ticketCommentService";

import {
  createTicketHistoryEntry,
} from "../../services/ticketHistoryService";

import {
  deleteTicket,
  getTicketById,
  updateTicket,
} from "../../services/ticketService";

import {
  calculateTicketSla,
} from "../../services/slaService";

import {
  getUserById,
} from "../../services/userService";

import type {
  TicketStatus,
} from "../../types/Ticket";

export default function TicketDetailsPage() {
  const navigate =
    useNavigate();

  const {
    id,
  } = useParams();

  const {
    user,
  } = useAuth();

  const {
    can,
  } = usePermissions();

  const {
    showSnackbar,
  } = useSnackbar();

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  const [
    deleteError,
    setDeleteError,
  ] = useState("");

  const [
    commentError,
    setCommentError,
  ] = useState("");

  const [
    isAddingComment,
    setIsAddingComment,
  ] = useState(false);

  const [
    refreshKey,
    setRefreshKey,
  ] = useState(0);

  const [
    statusDialogOpen,
    setStatusDialogOpen,
  ] = useState(false);

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState<TicketStatus>(
    "Aberto"
  );

  const [
    isUpdatingStatus,
    setIsUpdatingStatus,
  ] = useState(false);

  const [
    closeDialogOpen,
    setCloseDialogOpen,
  ] = useState(false);

  const [
    isClosingTicket,
    setIsClosingTicket,
  ] = useState(false);

  const ticketId =
    Number(id);

  const ticket =
    getTicketById(
      ticketId
    );

  function handleBack(): void {
    if (
      isDeleting ||
      isUpdatingStatus ||
      isClosingTicket
    ) {
      return;
    }

    navigate(
      "/tickets"
    );
  }

  if (!ticket) {
    return (
      <MainLayout title="Detalhes do Chamado">
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
          onClick={
            handleBack
          }
        >
          Voltar para chamados
        </Button>
      </MainLayout>
    );
  }

  /*
   * A partir deste ponto sabemos que o chamado existe.
   *
   * Criamos uma referência estável para que o TypeScript
   * preserve corretamente o tipo dentro dos handlers.
   */
  const currentTicket =
    ticket;

  const mayViewTicket =
    canViewTicket(
      user,
      currentTicket,
      can
    );

  const mayEditTicket =
    canEditTicket(
      user,
      currentTicket,
      can
    );

  const mayDeleteTicket =
    canDeleteTicket(
      user,
      can
    );

  const mayUpdateStatus =
    can(
      Permissions.tickets.updateStatus
    );

  const mayCloseTicket =
    can(
      Permissions.tickets.close
    );

  const mayComment =
    can(
      Permissions.tickets.comment
    );

  if (!mayViewTicket) {
    return (
      <MainLayout title="Detalhes do Chamado">
        <Alert severity="warning">
          Você não possui permissão para visualizar este
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
          onClick={
            handleBack
          }
        >
          Voltar para chamados
        </Button>
      </MainLayout>
    );
  }

  const currentTicketId =
    currentTicket.id;

  void refreshKey;

  const assignedTechnician =
    currentTicket.assignedTechnicianId ===
    null
      ? undefined
      : getUserById(
          currentTicket.assignedTechnicianId
        );

  let technicianName =
    "Não atribuído";

  if (
    currentTicket.assignedTechnicianId !==
    null
  ) {
    technicianName =
      assignedTechnician
        ? assignedTechnician.name
        : `Técnico não encontrado (#${currentTicket.assignedTechnicianId})`;
  }

  const sla =
    calculateTicketSla(
      currentTicket
    );

  const actionInProgress =
    isDeleting ||
    isUpdatingStatus ||
    isClosingTicket;

  function handleEdit(): void {
    if (
      !mayEditTicket ||
      actionInProgress
    ) {
      return;
    }

    navigate(
      `/tickets/${currentTicketId}/edit`
    );
  }

  function handleOpenStatusDialog():
    void {
    if (
      !mayUpdateStatus ||
      actionInProgress
    ) {
      return;
    }

    setSelectedStatus(
      currentTicket.status ===
        "Resolvido"
        ? "Em andamento"
        : currentTicket.status
    );

    setStatusDialogOpen(
      true
    );
  }

  function handleCloseStatusDialog():
    void {
    if (
      isUpdatingStatus
    ) {
      return;
    }

    setStatusDialogOpen(
      false
    );
  }

  async function handleConfirmStatusChange():
    Promise<void> {
    if (
      !user ||
      !mayUpdateStatus ||
      isUpdatingStatus
    ) {
      return;
    }

    if (
      selectedStatus ===
      currentTicket.status
    ) {
      setStatusDialogOpen(
        false
      );

      return;
    }

    setIsUpdatingStatus(
      true
    );

    try {
      const previousStatus =
        currentTicket.status;

      const updatedTicket =
        await Promise.resolve(
          updateTicket(
            currentTicketId,
            {
              status:
                selectedStatus,
            }
          )
        );

      if (!updatedTicket) {
        throw new Error(
          "Não foi possível atualizar o status do chamado."
        );
      }

      createTicketHistoryEntry({
        ticketId:
          currentTicketId,

        eventType:
          "status_changed",

        description:
          `${user.name} alterou o status de "${previousStatus}" para "${selectedStatus}".`,
      });

      setStatusDialogOpen(
        false
      );

      setRefreshKey(
        (currentValue) =>
          currentValue + 1
      );

      showSnackbar(
        `Status alterado para "${selectedStatus}".`,
        {
          severity:
            "success",
        }
      );
    } catch (error) {
      console.error(
        "Não foi possível atualizar o status do chamado.",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o status do chamado.";

      showSnackbar(
        message,
        {
          severity:
            "error",
        }
      );
    } finally {
      setIsUpdatingStatus(
        false
      );
    }
  }

  function handleOpenCloseDialog():
    void {
    if (
      !mayCloseTicket ||
      currentTicket.status ===
        "Resolvido" ||
      actionInProgress
    ) {
      return;
    }

    setCloseDialogOpen(
      true
    );
  }

  function handleCloseCloseDialog():
    void {
    if (
      isClosingTicket
    ) {
      return;
    }

    setCloseDialogOpen(
      false
    );
  }

  async function handleResolveTicket():
    Promise<void> {
    if (
      !user ||
      !mayCloseTicket ||
      isClosingTicket
    ) {
      return;
    }

    setIsClosingTicket(
      true
    );

    try {
      const previousStatus =
        currentTicket.status;

      const updatedTicket =
        await Promise.resolve(
          updateTicket(
            currentTicketId,
            {
              status:
                "Resolvido",
            }
          )
        );

      if (!updatedTicket) {
        throw new Error(
          "Não foi possível resolver o chamado."
        );
      }

      createTicketHistoryEntry({
        ticketId:
          currentTicketId,

        eventType:
          "status_changed",

        description:
          `${user.name} alterou o status de "${previousStatus}" para "Resolvido".`,
      });

      setCloseDialogOpen(
        false
      );

      setRefreshKey(
        (currentValue) =>
          currentValue + 1
      );

      showSnackbar(
        "Chamado resolvido com sucesso.",
        {
          severity:
            "success",
        }
      );
    } catch (error) {
      console.error(
        "Não foi possível resolver o chamado.",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível resolver o chamado.";

      showSnackbar(
        message,
        {
          severity:
            "error",
        }
      );
    } finally {
      setIsClosingTicket(
        false
      );
    }
  }

  function handleOpenDeleteDialog(): void {
    if (
      !mayDeleteTicket ||
      actionInProgress
    ) {
      return;
    }

    setDeleteError("");
    setDeleteDialogOpen(true);
  }

  function handleCloseDeleteDialog(): void {
    if (isDeleting) {
      return;
    }

    setDeleteError("");
    setDeleteDialogOpen(false);
  }

  function handleAddComment(
    message: string
  ): void {
    if (
      !user ||
      !mayComment ||
      isAddingComment
    ) {
      return;
    }

    setCommentError("");
    setIsAddingComment(true);

    try {
      createTicketComment({
        ticketId:
          currentTicketId,

        authorId:
          user.id,

        authorName:
          user.name,

        message,
      });

      createTicketHistoryEntry({
        ticketId:
          currentTicketId,

        eventType:
          "comment_added",

        description:
          `${user.name} adicionou um comentário.`,
      });

      setRefreshKey(
        (currentValue) =>
          currentValue + 1
      );

      showSnackbar(
        "Comentário adicionado com sucesso.",
        {
          severity:
            "success",
        }
      );
    } catch (error) {
      console.error(
        "Não foi possível adicionar o comentário.",
        error
      );

      const failureMessage =
        error instanceof Error
          ? error.message
          : "Não foi possível adicionar o comentário.";

      setCommentError(
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
      setIsAddingComment(
        false
      );
    }
  }

  function handleDelete(): void {
    if (
      !mayDeleteTicket ||
      isDeleting
    ) {
      setDeleteDialogOpen(
        false
      );

      return;
    }

    setDeleteError("");
    setIsDeleting(true);

    try {
      const deleted =
        deleteTicket(
          currentTicketId
        );

      if (!deleted) {
        throw new Error(
          "O serviço não confirmou a exclusão do chamado."
        );
      }

      deleteTicketComments(
        currentTicketId
      );

      setDeleteDialogOpen(
        false
      );

      showSnackbar(
        "Chamado excluído com sucesso.",
        {
          severity:
            "success",
        }
      );

      navigate(
        "/tickets"
      );
    } catch (error) {
      console.error(
        "Não foi possível excluir o chamado.",
        error
      );

      const failureMessage =
        "Não foi possível excluir o chamado. Tente novamente.";

      setDeleteError(
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
      setIsDeleting(
        false
      );
    }
  }

  return (
    <MainLayout title="Detalhes do Chamado">
      <Stack spacing={3}>
        <TicketHeader
          ticket={
            currentTicket
          }
        />

        <Paper
          variant="outlined"
          sx={{
            p: {
              xs: 2.5,
              md: 3,
            },
          }}
        >
          <Stack spacing={2}>
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
              <Typography
                variant="h6"
                fontWeight={700}
              >
                SLA do chamado
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Meta de{" "}
                {sla.targetHours}h para
                prioridade{" "}
                {currentTicket.priority}
              </Typography>
            </Stack>

            <SlaProgress
              ticket={
                currentTicket
              }
            />
          </Stack>
        </Paper>

        <TicketDescriptionCard
          description={
            currentTicket.description
          }
        />

        <TicketEquipmentCard
          ticket={
            currentTicket
          }
        />

        <TicketInfoCard
          technicianName={
            technicianName
          }
          technicianInactive={
            assignedTechnician?.status ===
            "Inativo"
          }
          createdAt={
            currentTicket.createdAt
          }
          updatedAt={
            currentTicket.updatedAt
          }
        />

        <Paper
          sx={{
            p: {
              xs: 2.5,
              md: 4,
            },
          }}
        >
          <TicketTimeline
            key={
              refreshKey
            }
            ticketId={
              currentTicketId
            }
            onAddComment={
              user &&
              mayComment
                ? handleAddComment
                : undefined
            }
            isAddingComment={
              isAddingComment
            }
            commentError={
              commentError
            }
            onClearCommentError={() =>
              setCommentError(
                ""
              )
            }
          />
        </Paper>

        <TicketActions
          onBack={
            handleBack
          }
          onUpdateStatus={
            mayUpdateStatus &&
            currentTicket.status !==
              "Resolvido"
              ? handleOpenStatusDialog
              : undefined
          }
          onClose={
            mayCloseTicket &&
            currentTicket.status !==
              "Resolvido"
              ? handleOpenCloseDialog
              : undefined
          }
          onEdit={
            mayEditTicket &&
            !actionInProgress
              ? handleEdit
              : undefined
          }
          onDelete={
            mayDeleteTicket &&
            !actionInProgress
              ? handleOpenDeleteDialog
              : undefined
          }
          disabled={
            actionInProgress
          }
        />
      </Stack>

      <Dialog
        open={
          statusDialogOpen &&
          mayUpdateStatus
        }
        onClose={
          isUpdatingStatus
            ? undefined
            : handleCloseStatusDialog
        }
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Alterar status
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2}
            sx={{
              pt: 1,
            }}
          >
            <DialogContentText>
              Selecione o novo status do chamado #
              {currentTicketId}.
            </DialogContentText>

            <FormControl
              fullWidth
              disabled={
                isUpdatingStatus
              }
            >
              <InputLabel id="ticket-status-label">
                Status
              </InputLabel>

              <Select
                labelId="ticket-status-label"
                label="Status"
                value={
                  selectedStatus
                }
                onChange={(event) =>
                  setSelectedStatus(
                    event.target
                      .value as TicketStatus
                  )
                }
              >
                <MenuItem value="Aberto">
                  Aberto
                </MenuItem>

                <MenuItem value="Em andamento">
                  Em andamento
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={
              handleCloseStatusDialog
            }
            disabled={
              isUpdatingStatus
            }
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              void handleConfirmStatusChange()
            }
            disabled={
              isUpdatingStatus ||
              selectedStatus ===
                currentTicket.status
            }
            startIcon={
              isUpdatingStatus ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : undefined
            }
          >
            {isUpdatingStatus
              ? "Salvando..."
              : "Salvar status"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={
          closeDialogOpen &&
          mayCloseTicket
        }
        onClose={
          isClosingTicket
            ? undefined
            : handleCloseCloseDialog
        }
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Resolver chamado
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Deseja marcar o chamado #{currentTicketId} como
            Resolvido?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={
              handleCloseCloseDialog
            }
            disabled={
              isClosingTicket
            }
          >
            Cancelar
          </Button>

          <Button
            color="success"
            variant="contained"
            onClick={() =>
              void handleResolveTicket()
            }
            disabled={
              isClosingTicket
            }
            startIcon={
              isClosingTicket ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : undefined
            }
          >
            {isClosingTicket
              ? "Resolvendo..."
              : "Resolver chamado"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={
          deleteDialogOpen &&
          mayDeleteTicket
        }
        onClose={
          isDeleting
            ? undefined
            : handleCloseDeleteDialog
        }
        fullWidth
        maxWidth="xs"
        disableEscapeKeyDown={
          isDeleting
        }
      >
        <DialogTitle>
          Excluir chamado
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <DialogContentText>
              Tem certeza de que deseja excluir o chamado #
              {currentTicketId}? Esta ação não poderá ser
              desfeita.
            </DialogContentText>

            {deleteError && (
              <Alert
                severity="error"
                onClose={
                  isDeleting
                    ? undefined
                    : () =>
                        setDeleteError(
                          ""
                        )
                }
              >
                {deleteError}
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={
              handleCloseDeleteDialog
            }
            disabled={
              isDeleting
            }
          >
            Cancelar
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={
              handleDelete
            }
            disabled={
              isDeleting
            }
            startIcon={
              isDeleting ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : undefined
            }
          >
            {isDeleting
              ? "Excluindo..."
              : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}