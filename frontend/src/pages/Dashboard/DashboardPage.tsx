import {
  Box,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import MainLayout from "../../components/layout/MainLayout";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import { getTickets } from "../../services/ticketService";

function DashboardPage() {
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

  const criticalTickets = tickets.filter(
    (ticket) => ticket.priority === "Crítica"
  ).length;

  const highPriorityTickets = tickets.filter(
    (ticket) => ticket.priority === "Alta"
  ).length;

  const mediumPriorityTickets = tickets.filter(
    (ticket) => ticket.priority === "Média"
  ).length;

  const lowPriorityTickets = tickets.filter(
    (ticket) => ticket.priority === "Baixa"
  ).length;

  const getPercentage = (value: number) => {
    if (totalTickets === 0) {
      return 0;
    }

    return Math.round((value / totalTickets) * 100);
  };

  const statusData = [
    {
      label: "Abertos",
      value: openTickets,
      percentage: getPercentage(openTickets),
    },
    {
      label: "Em andamento",
      value: inProgressTickets,
      percentage: getPercentage(inProgressTickets),
    },
    {
      label: "Resolvidos",
      value: resolvedTickets,
      percentage: getPercentage(resolvedTickets),
    },
  ];

  const priorityData = [
    {
      label: "Crítica",
      value: criticalTickets,
      percentage: getPercentage(criticalTickets),
    },
    {
      label: "Alta",
      value: highPriorityTickets,
      percentage: getPercentage(highPriorityTickets),
    },
    {
      label: "Média",
      value: mediumPriorityTickets,
      percentage: getPercentage(mediumPriorityTickets),
    },
    {
      label: "Baixa",
      value: lowPriorityTickets,
      percentage: getPercentage(lowPriorityTickets),
    },
  ];

  return (
    <MainLayout title="Dashboard">
      <Stack spacing={3}>
        <PageHeader
          title="Visão geral"
          subtitle="Acompanhe os principais indicadores do suporte."
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

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" fontWeight="bold">
                Chamados por status
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, mb: 3 }}
              >
                Distribuição atual dos chamados cadastrados.
              </Typography>

              <Stack spacing={3}>
                {statusData.map((item) => (
                  <Box key={item.label}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Typography variant="body2" fontWeight={500}>
                        {item.label}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {item.value} chamado
                        {item.value === 1 ? "" : "s"} ({item.percentage}%)
                      </Typography>
                    </Stack>

                    <LinearProgress
                      variant="determinate"
                      value={item.percentage}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" fontWeight="bold">
                Chamados por prioridade
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, mb: 3 }}
              >
                Distribuição dos chamados por nível de prioridade.
              </Typography>

              <Stack spacing={3}>
                {priorityData.map((item) => (
                  <Box key={item.label}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Typography variant="body2" fontWeight={500}>
                        {item.label}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {item.value} chamado
                        {item.value === 1 ? "" : "s"} ({item.percentage}%)
                      </Typography>
                    </Stack>

                    <LinearProgress
                      variant="determinate"
                      value={item.percentage}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </MainLayout>
  );
}

export default DashboardPage;