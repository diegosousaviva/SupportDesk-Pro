import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
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
  canDeleteTicket,
  canEditTicket,
  canViewTicket,
} from "../../auth/ticketAuthorization";

import MainLayout from "../../components/layout/MainLayout";
import SlaProgress from "../../components/sla/SlaProgress";
import TicketActions from "../../components/tickets/TicketActions";
import TicketDescriptionCard from "../../components/tickets/TicketDescriptionCard";
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
} from "../../services/ticketService";

import {
  calculateTicketSla,
} from "../../services/slaService";

import {
  getUserById,
} from "../../services/userService";

export default function TicketDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { user } = useAuth();
  const { can } = usePermissions();
  const { showSnackbar } =
    useSnackbar();

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

  const ticketId = Number(id);
  const ticket =
    getTicketById(ticketId);

  function handleBack(): void {
    if (isDeleting) {
      return;
    }

    navigate("/tickets");
  }

  if (!ticket) {
    return (
      <MainLayout title="Detalhes do Chamado">
        <Alert severity="error">
          Chamado não encontrado.
        </Alert>

        <Button
          sx={{ mt: 2 }}
          variant="outlined"
          startIcon={
            <ArrowBack />
          }
          onClick={handleBack}
        >
          Voltar para chamados
        </Button>
      </MainLayout>
    );
  }

  const mayViewTicket =
    canViewTicket(
      user,
      ticket,
      can
    );

  const mayEditTicket =
    canEditTicket(
      user,
      ticket,
      can
    );

  const mayDeleteTicket =
    canDeleteTicket(
      user,
      can
    );

  if (!mayViewTicket) {
    return (
      <MainLayout title="Detalhes do Chamado">
        <Alert severity="warning">
          Você não possui permissão
          para visualizar este chamado.
        </Alert>

        <Button
          sx={{ mt: 2 }}
          variant="outlined"
          startIcon={
            <ArrowBack />
          }
          onClick={handleBack}
        >
          Voltar para chamados
        </Button>
      </MainLayout>
    );
  }

  const currentTicketId =
    ticket.id;

  /*
   * Força uma nova renderização
   * depois da criação de comentário.
   */
  void refreshKey;

  const assignedTechnician =
    ticket.assignedTechnicianId ===
    null
      ? undefined
      : getUserById(
          ticket.assignedTechnicianId
        );

  let technicianName =
    "Não atribuído";

  if (
    ticket.assignedTechnicianId !==
    null
  ) {
    technicianName =
      assignedTechnician
        ? assignedTechnician.name
        : `Técnico não encontrado (#${ticket.assignedTechnicianId})`;
  }

  const sla =
    calculateTicketSla(
      ticket
    );

  function handleEdit(): void {
    if (
      !mayEditTicket ||
      isDeleting
    ) {
      return;
    }

    navigate(
      `/tickets/${currentTicketId}/edit`
    );
  }

  function handleOpenDeleteDialog(): void {
    if (
      !mayDeleteTicket ||
      isDeleting
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
        authorId: user.id,
        authorName: user.name,
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
          severity: "success",
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
        "Não foi possível adicionar o comentário.",
        {
          severity: "error",
        }
      );
    } finally {
      setIsAddingComment(false);
    }
  }

  function handleDelete(): void {
    if (
      !mayDeleteTicket ||
      isDeleting
    ) {
      setDeleteDialogOpen(false);

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

      setDeleteDialogOpen(false);

      showSnackbar(
        "Chamado excluído com sucesso.",
        {
          severity: "success",
        }
      );

      navigate("/tickets");
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
        "Não foi possível excluir o chamado.",
        {
          severity: "error",
        }
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <MainLayout title="Detalhes do Chamado">
      <Stack spacing={3}>
        <TicketHeader
          ticket={ticket}
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
                Meta de {sla.targetHours}h para prioridade{" "}
                {ticket.priority}
              </Typography>
            </Stack>

            <SlaProgress
              ticket={ticket}
            />
          </Stack>
        </Paper>

        <TicketDescriptionCard
          description={
            ticket.description
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
            ticket.createdAt
          }
          updatedAt={
            ticket.updatedAt
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
            key={refreshKey}
            ticketId={
              currentTicketId
            }
            onAddComment={
              user
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
              setCommentError("")
            }
          />
        </Paper>

        <TicketActions
          onBack={handleBack}
          onEdit={
            mayEditTicket &&
            !isDeleting
              ? handleEdit
              : undefined
          }
          onDelete={
            mayDeleteTicket &&
            !isDeleting
              ? handleOpenDeleteDialog
              : undefined
          }
        />
      </Stack>

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
              Tem certeza de que deseja
              excluir o chamado #
              {currentTicketId}? Esta
              ação não poderá ser
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
            disabled={isDeleting}
          >
            Cancelar
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={isDeleting}
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