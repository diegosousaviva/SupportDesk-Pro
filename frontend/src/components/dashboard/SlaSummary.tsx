import {
  AccessTimeOutlined,
  CheckCircleOutlined,
  ErrorOutlineOutlined,
  FlashOnOutlined,
  TimerOutlined,
} from "@mui/icons-material";

import {
  Box,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

interface SlaSummaryProps {
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
        Desempenho do atendimento no período.
      </Typography>

      <Stack spacing={2}>
        <Item
          icon={
            <CheckCircleOutlined color="success" />
          }
          label="Dentro do SLA"
          value={`${slaCompliance}%`}
        />

        <Divider />

        <Item
          icon={
            <ErrorOutlineOutlined color="error" />
          }
          label="Fora do SLA"
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
    </Paper>
  );
}

export default SlaSummary;