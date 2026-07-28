import {
  Box,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import { LineChart } from "@mui/x-charts/LineChart";

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

  const totalTickets = data.reduce(
    (total, item) => total + item.quantity,
    0
  );

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
          sx={{
            width: "100%",
            height: 340,
          }}
        >
          <LineChart
            dataset={data}
            xAxis={[
              {
                scaleType: "point",
                dataKey: "month",
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
                dataKey: "quantity",
                label: "Chamados criados",
                color: theme.palette.primary.main,
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
              bottom: 40,
              left: 30,
            }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            height: 340,
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