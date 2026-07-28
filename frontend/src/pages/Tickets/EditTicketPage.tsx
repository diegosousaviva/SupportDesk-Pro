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

import { getUsers } from "../../services/userService";

import type { Ticket } from "../../types/Ticket";

type TicketPriority = Ticket["priority"];
type TicketStatus = Ticket["status"];

const UNASSIGNED_TECHNICIAN_VALUE = "unassigned";

export default function EditTicketPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const ticketId = Number(id);
  const ticket = getTicketById(ticketId);

  const technicians = getUsers().filter(
    (user) =>
      user.role === "Técnico" &&
      (
        user.status === "Ativo" ||
        user.id === ticket?.assignedTechnicianId
      )
  );

  const [title, setTitle] = useState(
    ticket?.title ?? ""
  );

  const [category, setCategory] = useState(
    ticket?.category ?? ""
  );

  const [priority, setPriority] =
    useState<TicketPriority>(
      ticket?.priority ?? "Baixa"
    );

  const [status, setStatus] =
    useState<TicketStatus>(
      ticket?.status ?? "Aberto"
    );

  const [
    assignedTechnicianId,
    setAssignedTechnicianId,
  ] = useState(
    ticket?.assignedTechnicianId === null ||
      ticket?.assignedTechnicianId === undefined
      ? UNASSIGNED_TECHNICIAN_VALUE
      : String(ticket.assignedTechnicianId)
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

  const assignedTechnicianNumber =
    assignedTechnicianId ===
    UNASSIGNED_TECHNICIAN_VALUE
      ? null
      : Number(assignedTechnicianId);

  const assignedTechnicianExists =
    assignedTechnicianNumber === null ||
    technicians.some(
      (technician) =>
        technician.id === assignedTechnicianNumber
    );

  function handleSave(): void {
    const updatedTicket = updateTicket(
      currentTicketId,
      {
        title: title.trim(),
        category: category.trim(),
        priority,
        status,
        assignedTechnicianId:
          assignedTechnicianNumber,
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
                  event.target.value as TicketPriority
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
                  event.target.value as TicketStatus
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

            <TextField
              select
              label="Técnico responsável"
              value={assignedTechnicianId}
              onChange={(event) =>
                setAssignedTechnicianId(
                  event.target.value
                )
              }
              helperText={
                technicians.length === 0
                  ? "Não há técnicos ativos cadastrados."
                  : "Selecione o técnico responsável pelo chamado."
              }
              fullWidth
            >
              <MenuItem
                value={UNASSIGNED_TECHNICIAN_VALUE}
              >
                Não atribuído
              </MenuItem>

              {!assignedTechnicianExists &&
                assignedTechnicianNumber !== null && (
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

              {technicians.map((technician) => (
                <MenuItem
                  key={technician.id}
                  value={String(technician.id)}
                >
                  {technician.name}
                  {technician.status === "Inativo"
                    ? " — Inativo"
                    : ""}
                </MenuItem>
              ))}
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