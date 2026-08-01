import {
  CheckCircle,
  ConfirmationNumber,
  Schedule,
  Warning,
} from "@mui/icons-material";

import {
  Grid,
} from "@mui/material";

import StatCard from "./StatCard";

import type {
  DashboardMainMetrics,
} from "../../services/dashboardService";

interface DashboardCardsProps {
  metrics: DashboardMainMetrics;
}

export default function DashboardCards({
  metrics,
}: DashboardCardsProps) {
  return (
    <Grid
      container
      spacing={2}
    >
      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <StatCard
          title="Total de chamados"
          value={
            metrics.totalTickets
          }
          color="#1976d2"
          icon={
            <ConfirmationNumber />
          }
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <StatCard
          title="Chamados abertos"
          value={
            metrics.openTickets
          }
          color="#ed6c02"
          icon={<Warning />}
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <StatCard
          title="Em andamento"
          value={
            metrics.inProgressTickets
          }
          color="#0288d1"
          icon={<Schedule />}
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <StatCard
          title="Resolvidos"
          value={
            metrics.resolvedTickets
          }
          color="#2e7d32"
          icon={
            <CheckCircle />
          }
        />
      </Grid>
    </Grid>
  );
}