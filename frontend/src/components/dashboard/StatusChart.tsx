import {
  Box,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import { BarChart } from "@mui/x-charts/BarChart";

interface StatusChartProps {
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
}

function StatusChart({
  openTickets,
  inProgressTickets,
  resolvedTickets,
}: StatusChartProps) {
  const theme = useTheme();

  const hasTickets =
    openTickets > 0 ||
    inProgressTickets > 0 ||
    resolvedTickets > 0;

  return (
    <Paper
      sx={{
        p: 3,
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Chamados por status
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Distribuição atual dos chamados cadastrados.
        </Typography>
      </Stack>

      {hasTickets ? (
        <Box
          sx={{
            width: "100%",
            height: 320,
          }}
        >
          <BarChart
            dataset={[
              {
                status: "Abertos",
                quantidade: openTickets,
              },
              {
                status: "Em andamento",
                quantidade: inProgressTickets,
              },
              {
                status: "Resolvidos",
                quantidade: resolvedTickets,
              },
            ]}
            xAxis={[
              {
                scaleType: "band",
                dataKey: "status",
                tickLabelStyle: {
                  fill: theme.palette.text.secondary,
                  fontSize: 12,
                },
              },
            ]}
            yAxis={[
              {
                min: 0,
                tickMinStep: 1,
                tickLabelStyle: {
                  fill: theme.palette.text.secondary,
                },
              },
            ]}
            series={[
              {
                dataKey: "quantidade",
                label: "Chamados",
                color: theme.palette.primary.main,
                valueFormatter: (value) =>
                  `${value ?? 0} chamado${
                    value === 1 ? "" : "s"
                  }`,
              },
            ]}
            grid={{
              horizontal: true,
            }}
            borderRadius={8}
            margin={{
              top: 30,
              right: 20,
              bottom: 40,
              left: 20,
            }}
            hideLegend
          />
        </Box>
      ) : (
        <Box
          sx={{
            height: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Typography color="text.secondary">
            Ainda não existem chamados para exibir.
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default StatusChart;