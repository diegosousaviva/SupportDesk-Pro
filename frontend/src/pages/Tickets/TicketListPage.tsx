import {
  Chip,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import TicketFilters from "../../components/forms/TicketFilters";
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
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const matchesSearch = ticket.title
      .toLowerCase()
      .includes(normalizedSearch);

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
        <PageHeader
          title="Lista de chamados"
          subtitle="Gerencie, acompanhe e consulte os chamados cadastrados."
          buttonLabel="Novo chamado"
          onButtonClick={() => navigate("/tickets/new")}
        />

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
            <TicketFilters
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              priorityFilter={priorityFilter}
              onSearchChange={setSearchTerm}
              onStatusChange={setStatusFilter}
              onPriorityChange={setPriorityFilter}
            />

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