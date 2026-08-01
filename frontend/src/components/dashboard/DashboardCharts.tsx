import {
  Grid,
  Stack,
} from "@mui/material";

import CategoryChart from "./CategoryChart";
import MonthlyChart from "./MonthlyChart";
import PriorityChart from "./PriorityChart";
import StatusChart from "./StatusChart";
import TechnicianChart from "./TechnicianChart";

import type {
  CategoryChartItem,
  DashboardMainMetrics,
  MonthlyChartItem,
  TechnicianChartItem,
} from "../../services/dashboardService";

interface DashboardChartsProps {
  metrics: DashboardMainMetrics;

  categoryData: CategoryChartItem[];

  technicianData: TechnicianChartItem[];

  monthlyData: MonthlyChartItem[];
}

export default function DashboardCharts({
  metrics,
  categoryData,
  technicianData,
  monthlyData,
}: DashboardChartsProps) {
  return (
    <Stack spacing={3}>
      <Grid
        container
        spacing={3}
      >
        <Grid
          size={{
            xs: 12,
            lg: 7,
          }}
        >
          <StatusChart
            openTickets={
              metrics.openTickets
            }
            inProgressTickets={
              metrics.inProgressTickets
            }
            resolvedTickets={
              metrics.resolvedTickets
            }
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            lg: 5,
          }}
        >
          <PriorityChart
            criticalTickets={
              metrics.criticalTickets
            }
            highPriorityTickets={
              metrics.highPriorityTickets
            }
            mediumPriorityTickets={
              metrics.mediumPriorityTickets
            }
            lowPriorityTickets={
              metrics.lowPriorityTickets
            }
          />
        </Grid>
      </Grid>

      <Grid
        container
        spacing={3}
      >
        <Grid
          size={{
            xs: 12,
            lg: 6,
          }}
        >
          <CategoryChart
            data={
              categoryData
            }
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            lg: 6,
          }}
        >
          <TechnicianChart
            data={
              technicianData
            }
          />
        </Grid>
      </Grid>

      <MonthlyChart
        data={monthlyData}
      />
    </Stack>
  );
}