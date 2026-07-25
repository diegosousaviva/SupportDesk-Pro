import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";
import {
  deleteTicket,
  getTicketById,
} from "../../services/ticketService";

export default function TicketDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const ticketId = Number(id);
  const ticket = getTicketById(ticketId);

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
          onClick={() => navigate("/tickets")}
        >
          Voltar para chamados
        </Button>
      </MainLayout>
    );
  }

  function handleDelete() {
    const deleted = deleteTicket(ticket.id);

    if (deleted) {
      navigate("/tickets");
    }
  }

  return (
    <MainLayout title="Detalhes do Chamado">
      <Paper sx={{ p: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h5">
            Chamado #{ticket.id}
          </Typography>

          <Typography>
            <strong>Título:</strong> {ticket.title}
          </Typography>

          <Typography>
            <strong>Categoria:</strong> {ticket.category}
          </Typography>

          <Typography component="div">
            <strong>Prioridade:</strong>{" "}
            <Chip
              label={ticket.priority}
              color={
                ticket.priority === "Crítica" ||
                ticket.priority === "Alta"
                  ? "error"
                  : ticket.priority === "Média"
                    ? "warning"
                    : "success"
              }
              size="small"
            />
          </Typography>

          <Typography component="div">
            <strong>Status:</strong>{" "}
            <Chip
              label={ticket.status}
              color={
                ticket.status === "Aberto"
                  ? "warning"
                  : ticket.status === "Em andamento"
                    ? "info"
                    : "success"
              }
              size="small"
            />
          </Typography>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/tickets")}
            >
              Voltar
            </Button>

            <Button
              variant="contained"
              onClick={() =>
                navigate(`/tickets/${ticket.id}/edit`)
              }
            >
              Editar chamado
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Excluir chamado
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Excluir chamado</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Tem certeza de que deseja excluir o chamado #{ticket.id}?
            Esta ação não poderá ser desfeita.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
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