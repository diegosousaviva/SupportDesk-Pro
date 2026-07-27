import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
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
  CalendarMonth,
  DeleteOutline,
  EditOutlined,
  PersonOutline,
  Schedule,
} from "@mui/icons-material";

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";
import TicketTimeline from "../../components/tickets/TicketTimeline";

import {
  deleteTicket,
  getTicketById,
} from "../../services/ticketService";

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Data não disponível";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function TicketDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

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

  const currentTicketId = ticket.id;

  function handleDelete(): void {
    const deleted = deleteTicket(currentTicketId);

    if (deleted) {
      navigate("/tickets");
    }
  }

  return (
    <MainLayout title="Detalhes do Chamado">
      <Stack spacing={3}>
        <Paper
          sx={{
            p: {
              xs: 2.5,
              md: 4,
            },
          }}
        >
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",
              md: "center",
            }}
            spacing={2}
          >
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
              >
                Chamado #{currentTicketId}
              </Typography>

              <Typography
                variant="h4"
                component="h1"
                sx={{
                  mt: 0.5,
                  fontWeight: 700,
                }}
              >
                {ticket.title}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Categoria: {ticket.category}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
            >
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
              />

              <Chip
                label={ticket.status}
                color={
                  ticket.status === "Aberto"
                    ? "warning"
                    : ticket.status === "Em andamento"
                      ? "info"
                      : "success"
                }
              />
            </Stack>
          </Stack>
        </Paper>

        <Paper
          sx={{
            p: {
              xs: 2.5,
              md: 4,
            },
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
          >
            Descrição do problema
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography
            color={
              ticket.description.trim()
                ? "text.primary"
                : "text.secondary"
            }
            sx={{
              whiteSpace: "pre-line",
              lineHeight: 1.7,
              overflowWrap: "anywhere",
            }}
          >
            {ticket.description.trim() ||
              "Nenhuma descrição foi informada para este chamado."}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: {
              xs: 2.5,
              md: 4,
            },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              fontWeight: 700,
            }}
          >
            Informações do chamado
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              gap: 3,
            }}
          >
            <Stack direction="row" spacing={1.5}>
              <PersonOutline color="action" />

              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Técnico responsável
                </Typography>

                <Typography sx={{ fontWeight: 600 }}>
                  {ticket.assignedTechnicianId === null
                    ? "Não atribuído"
                    : `Técnico #${ticket.assignedTechnicianId}`}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5}>
              <CalendarMonth color="action" />

              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Data de abertura
                </Typography>

                <Typography sx={{ fontWeight: 600 }}>
                  {formatDate(ticket.createdAt)}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5}>
              <Schedule color="action" />

              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Última atualização
                </Typography>

                <Typography sx={{ fontWeight: 600 }}>
                  {formatDate(ticket.updatedAt)}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Paper>

        <Paper
          sx={{
            p: {
              xs: 2.5,
              md: 4,
            },
          }}
        >
          <TicketTimeline ticketId={currentTicketId} />
        </Paper>

        <Paper
          sx={{
            p: {
              xs: 2,
              md: 3,
            },
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            justifyContent="space-between"
            spacing={2}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/tickets")}
            >
              Voltar
            </Button>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1.5}
            >
              <Button
                variant="contained"
                startIcon={<EditOutlined />}
                onClick={() =>
                  navigate(
                    `/tickets/${currentTicketId}/edit`
                  )
                }
              >
                Editar chamado
              </Button>

              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutline />}
                onClick={() =>
                  setDeleteDialogOpen(true)
                }
              >
                Excluir chamado
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Stack>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Excluir chamado</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Tem certeza de que deseja excluir o chamado #
            {currentTicketId}? Esta ação não poderá ser
            desfeita.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
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