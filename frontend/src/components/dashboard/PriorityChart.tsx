import {
  Box,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import { PieChart } from "@mui/x-charts/PieChart";

import useChartWidth from "../../hooks/useChartWidth";

interface PriorityChartProps {
  criticalTickets: number;
  highPriorityTickets: number;
  mediumPriorityTickets: number;
  lowPriorityTickets: number;
}

function PriorityChart({
  criticalTickets,
  highPriorityTickets,
  mediumPriorityTickets,
  lowPriorityTickets,
}: PriorityChartProps) {
  const theme = useTheme();

  const {
    containerRef,
    chartWidth,
  } = useChartWidth();

  const chartHeight = 320;

  const totalTickets =
    criticalTickets +
    highPriorityTickets +
    mediumPriorityTickets +
    lowPriorityTickets;

  const chartData = [
    {
      id: 0,
      value: criticalTickets,
      label: "Crítica",
      color: theme.palette.error.main,
    },
    {
      id: 1,
      value: highPriorityTickets,
      label: "Alta",
      color: theme.palette.warning.dark,
    },
    {
      id: 2,
      value: mediumPriorityTickets,
      label: "Média",
      color: theme.palette.info.main,
    },
    {
      id: 3,
      value: lowPriorityTickets,
      label: "Baixa",
      color: theme.palette.success.main,
    },
  ].filter((item) => item.value > 0);

  return (
    <Paper
      sx={{
        p: 3,
        width: "100%",
        minWidth: 0,
        height: "100%",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          fontWeight={700}
        >
          Chamados por prioridade
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Distribuição dos chamados por nível de
          prioridade.
        </Typography>
      </Stack>

      {totalTickets > 0 ? (
        <Box
          ref={containerRef}
          sx={{
            width: "100%",
            minWidth: 0,
            height: chartHeight,
            overflow: "hidden",
          }}
        >
          {chartWidth > 320 && (
            <PieChart
              width={chartWidth}
              height={chartHeight}
              series={[
                {
                  data: chartData,
                  innerRadius: 65,
                  outerRadius: 100,
                  paddingAngle: 3,
                  cornerRadius: 5,
                  startAngle: -90,
                  endAngle: 270,
                  valueFormatter: (item) => {
                    const percentage =
                      Math.round(
                        (item.value /
                          totalTickets) *
                          100
                      );

                    return `${
                      item.value
                    } chamado${
                      item.value === 1
                        ? ""
                        : "s"
                    } (${percentage}%)`;
                  },
                },
              ]}
              margin={{
                top: 20,
                right: 20,
                bottom: 55,
                left: 20,
              }}
              slotProps={{
                legend: {
                  direction: "horizontal",
                  position: {
                    vertical: "bottom",
                    horizontal: "center",
                  },
                },
              }}
            />
          )}
        </Box>
      ) : (
        <Box
          sx={{
            height: chartHeight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Typography color="text.secondary">
            Ainda não existem prioridades para exibir.
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default PriorityChart;