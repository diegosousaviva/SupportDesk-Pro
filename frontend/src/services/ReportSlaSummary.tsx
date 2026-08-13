import {
  CheckCircleOutline,
  ErrorOutline,
  ScheduleOutlined,
  SpeedOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";

import {
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import StatCard from "../dashboard/StatCard";

import type {
  SlaSummary,
} from "../../services/slaService";

interface ReportSlaSummaryProps {
  summary: SlaSummary;
}

function ReportSlaSummary({
  summary,
}: ReportSlaSummaryProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: {
          xs: 2,
          md: 3,
        },
      }}
    >
      <Stack spacing={2.5}>
        <Stack spacing={0.5}>
          <Typography
            variant="h6"
            fontWeight={700}
          >
            Indicadores de SLA
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Acompanhe o cumprimento dos prazos dos chamados encontrados no relatório.
          </Typography>
        </Stack>

        <Grid
          container
          spacing={2}
        >
          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 2.4,
            }}
          >
            <StatCard
              title="Conformidade"
              value={`${summary.compliancePercentage}%`}
              color="#2e7d32"
              icon={
                <SpeedOutlined />
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 2.4,
            }}
          >
            <StatCard
              title="Dentro do SLA"
              value={
                summary.withinSlaTickets
              }
              color="#2e7d32"
              icon={
                <CheckCircleOutline />
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 2.4,
            }}
          >
            <StatCard
              title="Próximos do vencimento"
              value={
                summary.warningTickets
              }
              color="#ed6c02"
              icon={
                <WarningAmberOutlined />
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 2.4,
            }}
          >
            <StatCard
              title="SLA vencido"
              value={
                summary.expiredTickets
              }
              color="#d32f2f"
              icon={
                <ErrorOutline />
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 2.4,
            }}
          >
            <StatCard
              title="Resolvidos no prazo"
              value={
                summary.completedWithinSlaTickets
              }
              color="#0288d1"
              icon={
                <ScheduleOutlined />
              }
            />
          </Grid>
        </Grid>

        <Typography
          variant="caption"
          color="text.secondary"
        >
          Chamados resolvidos fora do SLA:{" "}
          <strong>
            {
              summary.completedExpiredTickets
            }
          </strong>
          {" • "}
          Chamados avaliados:{" "}
          <strong>
            {
              summary.totalTickets
            }
          </strong>
        </Typography>
      </Stack>
    </Paper>
  );
}

export default ReportSlaSummary;