import {
  Button,
  Chip,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Search } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";
import StatCard from "../../components/dashboard/StatCard";
import { getTickets } from "../../services/ticketService";

export default function TicketListPage() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [priorityFilter, setPriorityFilter] = useState("Todas");

  const tickets = getTickets();

  const totalTickets = tickets.length;

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "Aberto"
  ).length;

  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === "Em andamento"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "Resolvido"
  ).length;

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "Todos" ||
      ticket.status === statusFilter;

    const matchesPriority =
      priorityFilter === "Todas" ||
      ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <MainLayout title="Chamados">
      <Stack spacing={3}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total de chamados"
              value={totalTickets}
              color="#1976d2"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Chamados abertos"
              value={openTickets}
              color="#ed6c02"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Em andamento"
              value={inProgressTickets}
              color="#0288d1"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Resolvidos"
              value={resolvedTickets}
              color="#2e7d32"
            />
          </Grid>
        </Grid>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={2}
            >
              <Typography variant="h5">
                Lista de chamados
              </Typography>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate("/tickets/new")}
              >
                Novo chamado
              </Button>
            </Stack>

            <TextField
              label="Pesquisar chamado"
              placeholder="Digite o título do chamado"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
            >
              <TextField
                select
                label="Status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                fullWidth
              >
                <MenuItem value="Todos">Todos</MenuItem>
                <MenuItem value="Aberto">Aberto</MenuItem>
                <MenuItem value="Em andamento">
                  Em andamento
                </MenuItem>
                <MenuItem value="Resolvido">
                  Resolvido
                </MenuItem>
              </TextField>

              <TextField
                select
                label="Prioridade"
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(event.target.value)
                }
                fullWidth
              >
                <MenuItem value="Todas">Todas</MenuItem>
                <MenuItem value="Baixa">Baixa</MenuItem>
                <MenuItem value="Média">Média</MenuItem>
                <MenuItem value="Alta">Alta</MenuItem>
                <MenuItem value="Crítica">Crítica</MenuItem>
              </TextField>
            </Stack>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>ID</strong>
                    </TableCell>

                    <TableCell>
                      <strong>Título</strong>
                    </TableCell>

                    <TableCell>
                      <strong>Categoria</strong>
                    </TableCell>

                    <TableCell>
                      <strong>Prioridade</strong>
                    </TableCell>

                    <TableCell>
                      <strong>Status</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() =>
                        navigate(`/tickets/${ticket.id}`)
                      }
                    >
                      <TableCell>#{ticket.id}</TableCell>

                      <TableCell>{ticket.title}</TableCell>

                      <TableCell>{ticket.category}</TableCell>

                      <TableCell>
                        <Chip
                          label={ticket.priority}
                          size="small"
                          color={
                            ticket.priority === "Crítica" ||
                            ticket.priority === "Alta"
                              ? "error"
                              : ticket.priority === "Média"
                                ? "warning"
                                : "success"
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={ticket.status}
                          size="small"
                          color={
                            ticket.status === "Aberto"
                              ? "warning"
                              : ticket.status === "Em andamento"
                                ? "info"
                                : "success"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredTickets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Nenhum chamado encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Paper>
      </Stack>
    </MainLayout>
  );
}