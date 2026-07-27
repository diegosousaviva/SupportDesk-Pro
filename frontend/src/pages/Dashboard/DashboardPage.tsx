import {
  Alert,
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import WarningIcon from "@mui/icons-material/Warning";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import MainLayout from "../../components/layout/MainLayout";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import StatusChart from "../../components/dashboard/StatusChart";
import PriorityChart from "../../components/dashboard/PriorityChart";

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

  const resolvedPercentage =
    totalTickets === 0
      ? 0
      : Math.round(
          (resolvedTickets / totalTickets) * 100
        );

  const recentTickets = [...tickets]
    .sort(
      (firstTicket, secondTicket) =>
        secondTicket.id - firstTicket.id
    )
    .slice(0, 5);

  function getPriorityColor(
    priority: string
  ):
    | "error"
    | "warning"
    | "info"
    | "success"
    | "default" {
    switch (priority) {
      case "Crítica":
        return "error";

      case "Alta":
        return "warning";

      case "Média":
        return "info";

      case "Baixa":
        return "success";

      default:
        return "default";
    }
  }

  function getStatusColor(
    status: string
  ):
    | "warning"
    | "info"
    | "success"
    | "default" {
    switch (status) {
      case "Aberto":
        return "warning";

      case "Em andamento":
        return "info";

      case "Resolvido":
        return "success";

      default:
        return "default";
    }
  }

  return (
    <MainLayout title="Dashboard">
      <Stack spacing={3}>
        <PageHeader
          title="Visão geral"
          subtitle="Acompanhe os principais indicadores da central de suporte."
        />

        {criticalTickets > 0 && (
          <Alert severity="error" icon={<WarningIcon />}>
            Existem{" "}
            <strong>
              {criticalTickets} chamado
              {criticalTickets === 1 ? "" : "s"} crítico
              {criticalTickets === 1 ? "" : "s"}
            </strong>{" "}
            que precisam de atenção.
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total de chamados"
              value={totalTickets}
              color="#1976d2"
              icon={<ConfirmationNumberIcon />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Chamados abertos"
              value={openTickets}
              color="#ed6c02"
              icon={<WarningIcon />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Em andamento"
              value={inProgressTickets}
              color="#0288d1"
              icon={<ScheduleIcon />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Resolvidos"
              value={resolvedTickets}
              color="#2e7d32"
              icon={<CheckCircleIcon />}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <StatusChart
              openTickets={openTickets}
              inProgressTickets={inProgressTickets}
              resolvedTickets={resolvedTickets}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <PriorityChart
              criticalTickets={criticalTickets}
              highPriorityTickets={highPriorityTickets}
              mediumPriorityTickets={mediumPriorityTickets}
              lowPriorityTickets={lowPriorityTickets}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Stack spacing={0.5} sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  Últimos chamados
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Os cinco chamados cadastrados mais
                  recentemente.
                </Typography>
              </Stack>

              {recentTickets.length > 0 ? (
                <Stack spacing={1.5}>
                  {recentTickets.map((ticket) => (
                    <Box
                      key={ticket.id}
                      sx={{
                        display: "flex",
                        flexDirection: {
                          xs: "column",
                          sm: "row",
                        },
                        alignItems: {
                          xs: "flex-start",
                          sm: "center",
                        },
                        justifyContent: "space-between",
                        gap: 2,
                        p: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        transition:
                          "border-color 200ms ease, transform 200ms ease",
                        "&:hover": {
                          borderColor: "primary.main",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          color="primary.main"
                          fontWeight={700}
                        >
                          #{ticket.id}
                        </Typography>

                        <Typography
                          fontWeight={600}
                          noWrap
                        >
                          {ticket.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {ticket.category}
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
                          color={getPriorityColor(
                            ticket.priority
                          )}
                          size="small"
                          variant="outlined"
                        />

                        <Chip
                          label={ticket.status}
                          color={getStatusColor(
                            ticket.status
                          )}
                          size="small"
                        />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  Nenhum chamado foi cadastrado.
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Stack spacing={0.5} sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  Eficiência do suporte
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Percentual atual de chamados resolvidos.
                </Typography>
              </Stack>

              <Box
                sx={{
                  minHeight: 230,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    width: 150,
                    height: 150,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "14px solid",
                    borderColor: "success.main",
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(46, 125, 50, 0.12)"
                        : "rgba(46, 125, 50, 0.08)",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h3"
                      fontWeight={800}
                      color="success.main"
                    >
                      {resolvedPercentage}%
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      resolvidos
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  {resolvedTickets} de {totalTickets} chamado
                  {totalTickets === 1 ? "" : "s"} foram
                  resolvidos.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </MainLayout>
  );
}

export default DashboardPage;