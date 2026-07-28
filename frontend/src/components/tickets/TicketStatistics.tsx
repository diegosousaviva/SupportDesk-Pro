import Grid from "@mui/material/Grid";

import StatCard from "../dashboard/StatCard";

interface TicketStatisticsProps {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
}

export default function TicketStatistics({
  totalTickets,
  openTickets,
  inProgressTickets,
  resolvedTickets,
}: TicketStatisticsProps) {
  return (
    <Grid container spacing={2}>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <StatCard
          title="Total de chamados"
          value={totalTickets}
          color="#1976d2"
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
          value={openTickets}
          color="#ed6c02"
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
          value={inProgressTickets}
          color="#0288d1"
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
          value={resolvedTickets}
          color="#2e7d32"
        />
      </Grid>
    </Grid>
  );
}