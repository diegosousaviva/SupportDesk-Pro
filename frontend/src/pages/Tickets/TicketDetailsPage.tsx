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
} from "@mui/material";

import { ArrowBack } from "@mui/icons-material";

import { useState } from "react";

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
import TicketActions from "../../components/tickets/TicketActions";
import TicketDescriptionCard from "../../components/tickets/TicketDescriptionCard";
import TicketHeader from "../../components/tickets/TicketHeader";
import TicketInfoCard from "../../components/tickets/TicketInfoCard";
import TicketTimeline from "../../components/tickets/TicketTimeline";

import { useAuth } from "../../contexts/AuthContext";

import { usePermissions } from "../../hooks/usePermissions";
import { useSnackbar } from "../../hooks/useSnackbar";

import {
  deleteTicket,
  getTicketById,
} from "../../services/ticketService";

import {
  getUserById,
} from "../../services/userService";

export default function TicketDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { user } = useAuth();
  const { can } = usePermissions();
  const { showSnackbar } = useSnackbar();

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

  const ticketId = Number(id);
  const ticket = getTicketById(ticketId);

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
          startIcon={<ArrowBack />}
          onClick={handleBack}
        >
          Voltar para chamados
        </Button>
      </MainLayout>
    );
  }

  const mayViewTicket = canViewTicket(
    user,
    ticket,
    can
  );

  const mayEditTicket = canEditTicket(
    user,
    ticket,
    can
  );

  const mayDeleteTicket = canDeleteTicket(
    user,
    can
  );

  if (!mayViewTicket) {
    return (
      <MainLayout title="Detalhes do Chamado">
        <Alert severity="warning">
          Você não possui permissão para visualizar
          este chamado.
        </Alert>

        <Button
          sx={{ mt: 2 }}
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
        >
          Voltar para chamados
        </Button>
      </MainLayout>
    );
  }

  const currentTicketId = ticket.id;

  const assignedTechnician =
    ticket.assignedTechnicianId === null
      ? undefined
      : getUserById(
          ticket.assignedTechnicianId
        );

  let technicianName = "Não atribuído";

  if (ticket.assignedTechnicianId !== null) {
    technicianName = assignedTechnician
      ? assignedTechnician.name
      : `Técnico não encontrado (#${ticket.assignedTechnicianId})`;
  }

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
      const deleted = deleteTicket(
        currentTicketId
      );

      if (!deleted) {
        throw new Error(
          "O serviço não confirmou a exclusão do chamado."
        );
      }

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

      setDeleteError(failureMessage);

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
        <TicketHeader ticket={ticket} />

        <TicketDescriptionCard
          description={ticket.description}
        />

        <TicketInfoCard
          technicianName={technicianName}
          technicianInactive={
            assignedTechnician?.status ===
            "Inativo"
          }
          createdAt={ticket.createdAt}
          updatedAt={ticket.updatedAt}
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
            ticketId={currentTicketId}
          />
        </Paper>

        <TicketActions
          onBack={handleBack}
          onEdit={
            mayEditTicket && !isDeleting
              ? handleEdit
              : undefined
          }
          onDelete={
            mayDeleteTicket && !isDeleting
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
        disableEscapeKeyDown={isDeleting}
      >
        <DialogTitle>
          Excluir chamado
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <DialogContentText>
              Tem certeza de que deseja excluir o
              chamado #{currentTicketId}? Esta ação
              não poderá ser desfeita.
            </DialogContentText>

            {deleteError && (
              <Alert
                severity="error"
                onClose={
                  isDeleting
                    ? undefined
                    : () =>
                        setDeleteError("")
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
              isDeleting
                ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                    />
                  )
                : undefined
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