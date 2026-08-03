import {
  useState,
} from "react";

import {
  Alert,
  Grid,
  Stack,
} from "@mui/material";

import WarningIcon from "@mui/icons-material/Warning";

import PageHeader from "../../components/common/PageHeader";
import DashboardCards from "../../components/dashboard/DashboardCards";
import DashboardCharts from "../../components/dashboard/DashboardCharts";
import DashboardEfficiency from "../../components/dashboard/DashboardEfficiency";
import DashboardFilters from "../../components/dashboard/DashboardFilters";
import DashboardRecentTickets from "../../components/dashboard/DashboardRecentTickets";
import ExecutiveKpiCards from "../../components/dashboard/ExecutiveKpiCards";
import SlaSummary from "../../components/dashboard/SlaSummary";
import TechnicianRanking from "../../components/dashboard/TechnicianRanking";
import MainLayout from "../../components/layout/MainLayout";

import type {
  DashboardPeriod,
} from "../../components/dashboard/DashboardFilters";

import {
  createDashboardData,
} from "../../services/dashboardService";

import {
  getTickets,
} from "../../services/ticketService";

import {
  getUsers,
} from "../../services/userService";

function DashboardPage() {
  const [
    period,
    setPeriod,
  ] = useState<DashboardPeriod>(
    "30_days"
  );

  const dashboardData =
    createDashboardData({
      tickets: getTickets(),
      users: getUsers(),
      period,
    });

  const {
    mainMetrics,
    executiveMetrics,
    slaMetrics,
    categoryChartData,
    technicianChartData,
    monthlyChartData,
    recentTickets,
    technicianRanking,
  } = dashboardData;

  return (
    <MainLayout title="Dashboard">
      <Stack spacing={3}>
        <PageHeader
          title="Visão geral"
          subtitle="Acompanhe os principais indicadores da central de suporte."
        />

        <DashboardFilters
          period={period}
          onPeriodChange={
            setPeriod
          }
        />

        {mainMetrics.criticalTickets >
          0 && (
          <Alert
            severity="error"
            icon={<WarningIcon />}
          >
            Existem{" "}
            <strong>
              {
                mainMetrics.criticalTickets
              }{" "}
              chamado
              {mainMetrics.criticalTickets ===
              1
                ? ""
                : "s"}{" "}
              crítico
              {mainMetrics.criticalTickets ===
              1
                ? ""
                : "s"}
            </strong>{" "}
            que precisam de atenção.
          </Alert>
        )}

        <DashboardCards
          metrics={mainMetrics}
        />

        <ExecutiveKpiCards
          metrics={executiveMetrics}
        />

        <DashboardCharts
          metrics={mainMetrics}
          categoryData={
            categoryChartData
          }
          technicianData={
            technicianChartData
          }
          monthlyData={
            monthlyChartData
          }
        />

        <Grid
          container
          spacing={3}
        >
          <Grid
            size={{
              xs: 12,
              lg: 8,
            }}
          >
            <DashboardRecentTickets
              tickets={recentTickets}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              lg: 4,
            }}
          >
            <DashboardEfficiency
              resolvedTickets={
                mainMetrics.resolvedTickets
              }
              totalTickets={
                mainMetrics.totalTickets
              }
              resolvedPercentage={
                mainMetrics.resolvedPercentage
              }
            />
          </Grid>
        </Grid>

        <TechnicianRanking
          ranking={
            technicianRanking
          }
        />

        <SlaSummary
          withinSlaTickets={
            slaMetrics.withinSlaTickets
          }
          warningTickets={
            slaMetrics.warningTickets
          }
          expiredTickets={
            slaMetrics.expiredTickets
          }
          completedWithinSlaTickets={
            slaMetrics.completedWithinSlaTickets
          }
          completedExpiredTickets={
            slaMetrics.completedExpiredTickets
          }
          slaCompliance={
            slaMetrics.slaCompliance
          }
          slaViolation={
            slaMetrics.slaViolation
          }
          averageResolutionHours={
            slaMetrics.averageResolutionHours
          }
          fastestResolutionHours={
            slaMetrics.fastestResolutionHours
          }
          slowestResolutionHours={
            slaMetrics.slowestResolutionHours
          }
        />
      </Stack>
    </MainLayout>
  );
}

export default DashboardPage;