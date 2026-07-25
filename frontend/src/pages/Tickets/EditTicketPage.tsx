import {
  Alert,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";
import {
  getTicketById,
  updateTicket,
} from "../../services/ticketService";

export default function EditTicketPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const ticketId = Number(id);
  const ticket = getTicketById(ticketId);

  const [saved, setSaved] = useState(false);

  const [title, setTitle] = useState(ticket?.title ?? "");
  const [category, setCategory] = useState(ticket?.category ?? "");
  const [priority, setPriority] = useState(ticket?.priority ?? "Baixa");
  const [status, setStatus] = useState(ticket?.status ?? "Aberto");

  if (!ticket) {
    return (
      <MainLayout title="Editar Chamado">
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

  function handleSave() {
  const updatedTicket = updateTicket(ticket.id, {
    title,
    category,
    priority,
    status,
  });

  if (updatedTicket) {
    setSaved(true);
  }
}

  return (
    <MainLayout title="Editar Chamado">
      <Paper sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Typography variant="h5">
            Editar chamado #{ticket.id}
          </Typography>

          {saved && (
            <Alert severity="success">
              Alterações salvas com sucesso.
            </Alert>
          )}

          <TextField
            label="Título"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            fullWidth
          />

          <TextField
            label="Categoria"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            fullWidth
          />

          <TextField
            select
            label="Prioridade"
            value={priority}
            onChange={(event) =>
              setPriority(
                event.target.value as
                  | "Baixa"
                  | "Média"
                  | "Alta"
                  | "Crítica"
              )
            }
            fullWidth
          >
            <MenuItem value="Baixa">Baixa</MenuItem>
            <MenuItem value="Média">Média</MenuItem>
            <MenuItem value="Alta">Alta</MenuItem>
            <MenuItem value="Crítica">Crítica</MenuItem>
          </TextField>

          <TextField
            select
            label="Status"
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as
                  | "Aberto"
                  | "Em andamento"
                  | "Resolvido"
              )
            }
            fullWidth
          >
            <MenuItem value="Aberto">Aberto</MenuItem>
            <MenuItem value="Em andamento">
              Em andamento
            </MenuItem>
            <MenuItem value="Resolvido">
              Resolvido
            </MenuItem>
          </TextField>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              Cancelar
            </Button>

            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
            >
              Salvar alterações
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </MainLayout>
  );
}