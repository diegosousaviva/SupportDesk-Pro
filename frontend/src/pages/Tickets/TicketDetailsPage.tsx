import {
  Alert,
  Button,
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

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const ticketId = Number(id);
  const ticket = getTicketById(ticketId);

  function handleBack(): void {
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
    if (!mayEditTicket) {
      return;
    }

    navigate(
      `/tickets/${currentTicketId}/edit`
    );
  }

  function handleOpenDeleteDialog(): void {
    if (!mayDeleteTicket) {
      return;
    }

    setDeleteDialogOpen(true);
  }

  function handleCloseDeleteDialog(): void {
    setDeleteDialogOpen(false);
  }

  function handleDelete(): void {
    if (!mayDeleteTicket) {
      setDeleteDialogOpen(false);
      return;
    }

    const deleted = deleteTicket(
      currentTicketId
    );

    if (deleted) {
      navigate("/tickets");
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
            mayEditTicket
              ? handleEdit
              : undefined
          }
          onDelete={
            mayDeleteTicket
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
        onClose={handleCloseDeleteDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Excluir chamado
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Tem certeza de que deseja excluir o
            chamado #{currentTicketId}? Esta ação
            não poderá ser desfeita.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={
              handleCloseDeleteDialog
            }
          >
            Cancelar
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}