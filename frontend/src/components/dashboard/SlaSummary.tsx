import {
  AccessTimeOutlined,
  CheckCircleOutlined,
  ErrorOutlineOutlined,
  FlashOnOutlined,
  TimerOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";

import {
  Box,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

interface SlaSummaryProps {
  withinSlaTickets: number;
  warningTickets: number;
  expiredTickets: number;
  completedWithinSlaTickets: number;
  completedExpiredTickets: number;
  slaCompliance: number;
  slaViolation: number;
  averageResolutionHours: number;
  fastestResolutionHours: number;
  slowestResolutionHours: number;
}

interface ItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function Item({
  icon,
  label,
  value,
}: ItemProps) {
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
    >
      <Box>{icon}</Box>

      <Box flex={1}>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {label}
        </Typography>

        <Typography
          fontWeight={700}
          variant="h6"
        >
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

function SlaSummary({
  withinSlaTickets,
  warningTickets,
  expiredTickets,
  completedWithinSlaTickets,
  completedExpiredTickets,
  slaCompliance,
  slaViolation,
  averageResolutionHours,
  fastestResolutionHours,
  slowestResolutionHours,
}: SlaSummaryProps) {
  return (
    <Paper
      sx={{
        p: 3,
        height: "100%",
      }}
    >
      <Typography
        variant="h6"
        fontWeight={700}
      >
        Indicadores de SLA
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Situação atual dos chamados e desempenho dos
        atendimentos concluídos.
      </Typography>

      <Grid
        container
        spacing={3}
      >
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <Stack spacing={2}>
            <Item
              icon={
                <CheckCircleOutlined color="success" />
              }
              label="Ativos dentro do SLA"
              value={String(
                withinSlaTickets
              )}
            />

            <Divider />

            <Item
              icon={
                <WarningAmberOutlined color="warning" />
              }
              label="Próximos do vencimento"
              value={String(
                warningTickets
              )}
            />

            <Divider />

            <Item
              icon={
                <ErrorOutlineOutlined color="error" />
              }
              label="SLA vencido"
              value={String(
                expiredTickets
              )}
            />

            <Divider />

            <Item
              icon={
                <CheckCircleOutlined color="success" />
              }
              label="Resolvidos dentro do SLA"
              value={String(
                completedWithinSlaTickets
              )}
            />

            <Divider />

            <Item
              icon={
                <ErrorOutlineOutlined color="error" />
              }
              label="Resolvidos fora do SLA"
              value={String(
                completedExpiredTickets
              )}
            />
          </Stack>
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <Stack spacing={2}>
            <Item
              icon={
                <CheckCircleOutlined color="success" />
              }
              label="Conformidade"
              value={`${slaCompliance}%`}
            />

            <Divider />

            <Item
              icon={
                <ErrorOutlineOutlined color="error" />
              }
              label="Violação"
              value={`${slaViolation}%`}
            />

            <Divider />

            <Item
              icon={
                <AccessTimeOutlined color="primary" />
              }
              label="Tempo médio"
              value={`${averageResolutionHours} h`}
            />

            <Divider />

            <Item
              icon={
                <FlashOnOutlined color="warning" />
              }
              label="Melhor tempo"
              value={`${fastestResolutionHours} h`}
            />

            <Divider />

            <Item
              icon={
                <TimerOutlined color="secondary" />
              }
              label="Maior tempo"
              value={`${slowestResolutionHours} h`}
            />
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default SlaSummary;