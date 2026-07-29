import {
  Box,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import { BarChart } from "@mui/x-charts/BarChart";

import useChartWidth from "../../hooks/useChartWidth";

interface CategoryChartItem {
  [key: string]: string | number;
  category: string;
  quantity: number;
}

interface CategoryChartProps {
  data: CategoryChartItem[];
}

function CategoryChart({
  data,
}: CategoryChartProps) {
  const theme = useTheme();

  const {
    containerRef,
    chartWidth,
  } = useChartWidth();

  const chartHeight = Math.max(
    320,
    data.length * 55
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
          Chamados por categoria
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Categorias que concentram mais solicitações de
          suporte.
        </Typography>
      </Stack>

      {data.length > 0 ? (
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
            <BarChart
              width={chartWidth}
              height={chartHeight}
              dataset={data}
              xAxis={[
                {
                  scaleType: "band",
                  dataKey: "category",
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
                  label: "Chamados",
                  color:
                    theme.palette.secondary.main,
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
                bottom: 50,
                left: 50,
              }}
              hideLegend
            />
          )}
        </Box>
      ) : (
        <Box
          sx={{
            width: "100%",
            minWidth: 0,
            height: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Typography color="text.secondary">
            Ainda não existem categorias para exibir.
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default CategoryChart;