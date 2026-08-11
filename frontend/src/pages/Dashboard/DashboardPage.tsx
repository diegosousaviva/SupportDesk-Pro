import {
  useState,
} from "react";

import {
  Alert,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import WarningIcon from "@mui/icons-material/Warning";

import {
  Permissions,
} from "../../auth/permissions";

import PageHeader from "../../components/common/PageHeader";
import DashboardCards from "../../components/dashboard/DashboardCards";
import DashboardCharts from "../../components/dashboard/DashboardCharts";
import DashboardEfficiency from "../../components/dashboard/DashboardEfficiency";
import DashboardFilters from "../../components/dashboard/DashboardFilters";
import DashboardInventoryCards from "../../components/dashboard/DashboardInventoryCards";
import DashboardRecentActivity from "../../components/dashboard/DashboardRecentActivity";
import DashboardRecentTickets from "../../components/dashboard/DashboardRecentTickets";
import DashboardStoreInventory from "../../components/dashboard/DashboardStoreInventory";
import ExecutiveKpiCards from "../../components/dashboard/ExecutiveKpiCards";
import SlaSummary from "../../components/dashboard/SlaSummary";
import TechnicianRanking from "../../components/dashboard/TechnicianRanking";
import MainLayout from "../../components/layout/MainLayout";

import type {
  DashboardPeriod,
  DashboardStoreFilter,
} from "../../components/dashboard/DashboardFilters";

import {
  useAuth,
} from "../../contexts/AuthContext";

import {
  usePermissions,
} from "../../hooks/usePermissions";

import {
  createDashboardData,
} from "../../services/dashboardService";

import {
  getInventoryItems,
} from "../../services/inventoryService";

import {
  getRecentActivities,
} from "../../services/recentActivityService";

import {
  getStores,
} from "../../services/storeService";

import {
  getTickets,
} from "../../services/ticketService";

import {
  getUsers,
} from "../../services/userService";

function DashboardPage() {
  const {
    user,
  } = useAuth();

  const {
    can,
  } = usePermissions();

  const [
    period,
    setPeriod,
  ] =
    useState<DashboardPeriod>(
      "30_days"
    );

  const [
    storeFilter,
    setStoreFilter,
  ] =
    useState<DashboardStoreFilter>(
      "all"
    );

  const isAdministrator =
    user?.role ===
    "Administrador";

  const isTechnician =
    user?.role ===
    "Técnico";

  const isRequester =
    user?.role ===
    "Solicitante";

  const canViewInventory =
    can(
      Permissions.inventory.view
    );

  const canViewStores =
    can(
      Permissions.stores.view
    );

  const canUseStoreFilter =
    canViewInventory ||
    canViewStores;

  const allTickets =
    getTickets();

  const allUsers =
    getUsers();

  const allInventoryItems =
    getInventoryItems();

  const allStores =
    getStores();

  const visibleTickets =
    !user
      ? []
      : isAdministrator
        ? allTickets
        : isTechnician
          ? allTickets.filter(
              (ticket) =>
                ticket.assignedTechnicianId ===
                user.id
            )
          : isRequester
            ? allTickets.filter(
                (ticket) =>
                  ticket.requesterUserId ===
                  user.id
              )
            : [];

  const visibleInventoryItems =
    canViewInventory
      ? allInventoryItems
      : [];

  const visibleStores =
    canUseStoreFilter
      ? allStores
      : [];

  const effectiveStoreFilter =
    canUseStoreFilter
      ? storeFilter
      : "all";

  const dashboardData =
    createDashboardData({
      tickets:
        visibleTickets,

      users:
        allUsers,

      inventoryItems:
        visibleInventoryItems,

      stores:
        visibleStores,

      period,

      storeFilter:
        effectiveStoreFilter,
    });

  const allRecentActivities =
    getRecentActivities({
      period,

      storeFilter:
        effectiveStoreFilter,

      limit:
        50,
    });

  const visibleTicketIds =
    new Set(
      visibleTickets.map(
        (ticket) =>
          ticket.id
      )
    );

  const visibleInventoryItemIds =
    new Set(
      visibleInventoryItems.map(
        (item) =>
          item.id
      )
    );

  const recentActivities =
    allRecentActivities
      .filter(
        (activity) => {
          if (
            activity.source ===
            "Chamado"
          ) {
            return visibleTicketIds.has(
              activity.referenceId
            );
          }

          if (
            activity.source ===
            "Inventário"
          ) {
            return (
              canViewInventory &&
              visibleInventoryItemIds.has(
                activity.referenceId
              )
            );
          }

          return false;
        }
      )
      .slice(
        0,
        10
      );

  const {
    mainMetrics,

    executiveMetrics,

    inventoryMetrics,

    storeInventoryData,

    slaMetrics,

    categoryChartData,

    technicianChartData,

    monthlyChartData,

    recentTickets,

    technicianRanking,
  } = dashboardData;

  function handleClearFilters(): void {
    setPeriod(
      "30_days"
    );

    setStoreFilter(
      "all"
    );
  }

  return (
    <MainLayout title="Dashboard">
      <Stack spacing={3}>
        <PageHeader
          title="Visão geral"
          subtitle={
            isAdministrator
              ? "Acompanhe os principais indicadores da central de suporte."
              : isTechnician
                ? "Acompanhe os chamados atribuídos a você e os principais indicadores do atendimento."
                : "Acompanhe seus chamados e os principais indicadores de atendimento."
          }
        />

        <DashboardFilters
          period={
            period
          }
          storeFilter={
            effectiveStoreFilter
          }
          stores={
            visibleStores
          }
          showStoreFilter={
            canUseStoreFilter
          }
          onPeriodChange={
            setPeriod
          }
          onStoreFilterChange={
            setStoreFilter
          }
          onClearFilters={
            handleClearFilters
          }
        />

        {mainMetrics.criticalTickets >
          0 && (
          <Alert
            severity="error"
            icon={
              <WarningIcon />
            }
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
          metrics={
            mainMetrics
          }
        />

        {isAdministrator && (
          <ExecutiveKpiCards
            metrics={
              executiveMetrics
            }
          />
        )}

        <DashboardCharts
          metrics={
            mainMetrics
          }
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
              tickets={
                recentTickets
              }
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

        <DashboardRecentActivity
          activities={
            recentActivities
          }
        />

        {isAdministrator && (
          <TechnicianRanking
            ranking={
              technicianRanking
            }
          />
        )}

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

        {canViewInventory && (
          <>
            <Stack spacing={1.5}>
              <Typography
                variant="h5"
                component="h2"
                fontWeight={700}
              >
                Visão do Inventário
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Acompanhe a situação atual dos equipamentos cadastrados no inventário.
              </Typography>
            </Stack>

            <DashboardInventoryCards
              metrics={
                inventoryMetrics
              }
            />

            <DashboardStoreInventory
              data={
                storeInventoryData
              }
            />
          </>
        )}
      </Stack>
    </MainLayout>
  );
}

export default DashboardPage;