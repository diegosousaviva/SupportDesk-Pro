import {
  Box,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import { LineChart } from "@mui/x-charts/LineChart";

import useChartWidth from "../../hooks/useChartWidth";

interface MonthlyChartItem {
  [key: string]: string | number;
  month: string;
  quantity: number;
}

interface MonthlyChartProps {
  data: MonthlyChartItem[];
}

function MonthlyChart({
  data,
}: MonthlyChartProps) {
  const theme = useTheme();

  const {
    containerRef,
    chartWidth,
  } = useChartWidth();

  const chartHeight = 340;

  const totalTickets = data.reduce(
    (total, item) => total + item.quantity,
    0
  );

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
      <Stack
        spacing={0.5}
        sx={{
          mb: 2,
          minWidth: 0,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
        >
          Evolução dos chamados
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Quantidade de chamados criados nos últimos seis
          meses.
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
            <LineChart
              width={chartWidth}
              height={chartHeight}
              dataset={data}
              xAxis={[
                {
                  scaleType: "point",
                  dataKey: "month",
                  tickLabelStyle: {
                    fill:
                      theme.palette.text.secondary,
                    fontSize: 12,
                  },
                },
              ]}
              yAxis={[
                {
                  min: 0,
                  tickMinStep: 1,
                  tickLabelStyle: {
                    fill:
                      theme.palette.text.secondary,
                  },
                },
              ]}
              series={[
                {
                  dataKey: "quantity",
                  label: "Chamados criados",
                  color:
                    theme.palette.primary.main,
                  area: true,
                  showMark: true,
                  curve: "monotoneX",
                  valueFormatter: (value) =>
                    `${value ?? 0} chamado${
                      value === 1 ? "" : "s"
                    }`,
                },
              ]}
              grid={{
                horizontal: true,
                vertical: true,
              }}
              margin={{
                top: 30,
                right: 30,
                bottom: 50,
                left: 50,
              }}
            />
          )}
        </Box>
      ) : (
        <Box
          sx={{
            width: "100%",
            minWidth: 0,
            height: chartHeight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Typography color="text.secondary">
            Ainda não existem chamados recentes para
            exibir.
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default MonthlyChart;