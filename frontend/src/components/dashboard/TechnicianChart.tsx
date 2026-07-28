import {
  Box,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import { BarChart } from "@mui/x-charts/BarChart";

interface TechnicianChartItem {
  [key: string]: string | number;
  technician: string;
  quantity: number;
}

interface TechnicianChartProps {
  data: TechnicianChartItem[];
}

function TechnicianChart({
  data,
}: TechnicianChartProps) {
  const theme = useTheme();

  const chartHeight = Math.max(
    320,
    data.length * 55
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
          Chamados por técnico
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Distribuição atual da carga de trabalho da
          equipe.
        </Typography>
      </Stack>

      {data.length > 0 ? (
        <Box
          sx={{
            width: "100%",
            height: chartHeight,
          }}
        >
          <BarChart
            dataset={data}
            xAxis={[
              {
                scaleType: "band",
                dataKey: "technician",
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
                label: "Chamados",
                color: theme.palette.info.main,
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
              bottom: 60,
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
            Ainda não existem técnicos ou chamados para
            exibir.
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default TechnicianChart;