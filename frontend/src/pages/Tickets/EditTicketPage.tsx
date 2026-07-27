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

  const [title, setTitle] = useState(
    ticket?.title ?? ""
  );

  const [category, setCategory] = useState(
    ticket?.category ?? ""
  );

  const [priority, setPriority] = useState(
    ticket?.priority ?? "Baixa"
  );

  const [status, setStatus] = useState(
    ticket?.status ?? "Aberto"
  );

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

  const currentTicketId = ticket.id;
  const ticketDetailsPath = `/tickets/${currentTicketId}`;

  function handleSave(): void {
    const updatedTicket = updateTicket(
      currentTicketId,
      {
        title: title.trim(),
        category: category.trim(),
        priority,
        status,
      }
    );

    if (updatedTicket) {
      navigate(ticketDetailsPath);
    }
  }

  return (
    <MainLayout title="Editar Chamado">
      <Stack spacing={2}>
        <Button
          variant="text"
          startIcon={<ArrowBack />}
          onClick={() => navigate(ticketDetailsPath)}
          sx={{
            alignSelf: "flex-start",
          }}
        >
          Voltar aos detalhes
        </Button>

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
              sx={{ fontWeight: 700 }}
            >
              Editar chamado #{currentTicketId}
            </Typography>

            <TextField
              label="Título"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              fullWidth
            />

            <TextField
              label="Categoria"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
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

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
            >
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() =>
                  navigate(ticketDetailsPath)
                }
              >
                Cancelar
              </Button>

              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={
                  !title.trim() ||
                  !category.trim()
                }
              >
                Salvar alterações
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </MainLayout>
  );
}