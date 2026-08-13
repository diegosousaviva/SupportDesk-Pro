import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  CheckCircleOutline,
  ConfirmationNumberOutlined,
  PendingActionsOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";

import {
  Grid,
  Stack,
} from "@mui/material";

import MainLayout from "../../components/layout/MainLayout";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import CategoryReportTable from "../../components/reports/CategoryReportTable";
import ReportActions from "../../components/reports/ReportActions";
import ReportFilters from "../../components/reports/ReportFilters";
import ReportSlaSummary from "../../components/reports/ReportSlaSummary";
import ReportTable from "../../components/reports/ReportTable";
import StoreReportTable from "../../components/reports/StoreReportTable";
import TechnicianReportTable from "../../components/reports/TechnicianReportTable";

import {
  exportTicketsToCsv,
} from "../../services/reportExportService";

import {
  exportTicketsToExcel,
} from "../../services/reportExcelService";

import {
  exportTicketsToPdf,
} from "../../services/reportPdfService";

import type {
  ReportFiltersData,
} from "../../components/reports/ReportFilters";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

import {
  calculateSlaSummary,
} from "../../services/slaService";

import {
  getTickets,
} from "../../services/ticketService";

import {
  createTechnicianReport,
} from "../../services/technicianReportService";

import {
  createStoreReport,
} from "../../services/storeReportService";

import {
  createCategoryReport,
} from "../../services/categoryReportService";

import {
  getInventoryItems,
} from "../../services/inventoryService";

import {
  getStores,
} from "../../services/storeService";

import {
  getUsers,
} from "../../services/userService";

const initialFilters: ReportFiltersData = {
  period: "year",
  status: "",
  priority: "",
  technician: "",
  category: "",
  search: "",
};

function normalizeText(
  value: string
): string {
  return value
    .trim()
    .toLocaleLowerCase(
      "pt-BR"
    );
}

function getPeriodStartDate(
  period: string
): Date | null {
  const currentDate =
    new Date();

  const startDate =
    new Date(
      currentDate
    );

  startDate.setHours(
    0,
    0,
    0,
    0
  );

  switch (period) {
    case "today":
      return startDate;

    case "7_days":
      startDate.setDate(
        startDate.getDate() -
          6
      );

      return startDate;

    case "30_days":
      startDate.setDate(
        startDate.getDate() -
          29
      );

      return startDate;

    case "month":
      startDate.setDate(
        1
      );

      return startDate;

    case "year":
      startDate.setMonth(
        0,
        1
      );

      return startDate;

    default:
      return null;
  }
}

function ReportsPage() {
  const navigate =
    useNavigate();

  const {
    showSnackbar,
  } = useSnackbar();

  const tickets =
    getTickets();

  const users =
    getUsers();

  const inventoryItems =
    getInventoryItems();

  const stores =
    getStores();

  const [
    filters,
    setFilters,
  ] =
    useState<ReportFiltersData>(
      initialFilters
    );

  function handleFilterChange(
    field:
      keyof ReportFiltersData,
    value:
      string
  ): void {
    setFilters(
      (
        currentFilters
      ) => ({
        ...currentFilters,

        [field]:
          value,
      })
    );
  }

  function handleClearFilters(): void {
    setFilters(
      initialFilters
    );
  }

  const filteredTickets =
    useMemo(
      () => {
        const periodStartDate =
          getPeriodStartDate(
            filters.period
          );

        const normalizedTechnician =
          normalizeText(
            filters.technician
          );

        const normalizedCategory =
          normalizeText(
            filters.category
          );

        const normalizedSearch =
          normalizeText(
            filters.search
          );

        return tickets.filter(
          (ticket) => {
            const createdAt =
              new Date(
                ticket.createdAt
              );

            const matchesPeriod =
              periodStartDate ===
                null ||
              (
                !Number.isNaN(
                  createdAt.getTime()
                ) &&
                createdAt >=
                  periodStartDate
              );

            const matchesStatus =
              !filters.status ||
              ticket.status ===
                filters.status;

            const matchesPriority =
              !filters.priority ||
              ticket.priority ===
                filters.priority;

            const technician =
              ticket.assignedTechnicianId ===
              null
                ? undefined
                : users.find(
                    (user) =>
                      user.id ===
                      ticket.assignedTechnicianId
                  );

            const technicianName =
              technician?.name ??
              "Não atribuído";

            const matchesTechnician =
              !normalizedTechnician ||
              normalizeText(
                technicianName
              ).includes(
                normalizedTechnician
              );

            const matchesCategory =
              !normalizedCategory ||
              normalizeText(
                ticket.category
              ).includes(
                normalizedCategory
              );

            const searchableContent =
              normalizeText(
                [
                  ticket.id,
                  ticket.title,
                  ticket.description,
                  ticket.category,
                  technicianName,
                ].join(
                  " "
                )
              );

            const matchesSearch =
              !normalizedSearch ||
              searchableContent.includes(
                normalizedSearch
              );

            return (
              matchesPeriod &&
              matchesStatus &&
              matchesPriority &&
              matchesTechnician &&
              matchesCategory &&
              matchesSearch
            );
          }
        );
      },
      [
        filters,
        tickets,
        users,
      ]
    );

  const totalTickets =
    filteredTickets.length;

  const openTickets =
    filteredTickets.filter(
      (ticket) =>
        ticket.status ===
        "Aberto"
    ).length;

  const inProgressTickets =
    filteredTickets.filter(
      (ticket) =>
        ticket.status ===
        "Em andamento"
    ).length;

  const resolvedTickets =
    filteredTickets.filter(
      (ticket) =>
        ticket.status ===
        "Resolvido"
    ).length;

  const criticalTickets =
    filteredTickets.filter(
      (ticket) =>
        ticket.priority ===
        "Crítica"
    ).length;

  const slaSummary =
    calculateSlaSummary(
      filteredTickets
    );

  const technicianReport =
    createTechnicianReport(
      filteredTickets,
      users
    );

  const storeReport =
    createStoreReport(
      filteredTickets,
      inventoryItems,
      stores
    );

  const categoryReport =
    createCategoryReport(
      filteredTickets
    );

  function handleExportPdf(): void {
    if (
      filteredTickets.length ===
      0
    ) {
      showSnackbar(
        "Não há chamados para exportar.",
        {
          severity:
            "warning",
        }
      );

      return;
    }

    exportTicketsToPdf({
      tickets:
        filteredTickets,

      users,

      inventoryItems,

      stores,

      summary: {
        totalTickets,

        openTickets,

        inProgressTickets,

        resolvedTickets,

        criticalTickets,
      },
    });

    showSnackbar(
      "Relatório PDF exportado com sucesso.",
      {
        severity:
          "success",
      }
    );
  }

  function handleExportExcel(): void {
    if (
      filteredTickets.length ===
      0
    ) {
      showSnackbar(
        "Não há chamados para exportar.",
        {
          severity:
            "warning",
        }
      );

      return;
    }

    exportTicketsToExcel(
      filteredTickets,
      users,
      inventoryItems,
      stores
    );

    showSnackbar(
      "Relatório Excel exportado com sucesso.",
      {
        severity:
          "success",
      }
    );
  }

  function handleExportCsv(): void {
    if (
      filteredTickets.length ===
      0
    ) {
      showSnackbar(
        "Não há chamados para exportar.",
        {
          severity:
            "warning",
        }
      );

      return;
    }

    exportTicketsToCsv(
      filteredTickets,
      users
    );

    showSnackbar(
      "Relatório CSV exportado com sucesso.",
      {
        severity:
          "success",
      }
    );
  }

  function handlePrint(): void {
    if (
      filteredTickets.length ===
      0
    ) {
      showSnackbar(
        "Não há chamados para imprimir.",
        {
          severity:
            "warning",
        }
      );

      return;
    }

    window.print();
  }

  return (
    <MainLayout title="Relatórios">
      <Stack spacing={3}>
        <PageHeader
          title="Relatórios"
          subtitle="Consulte indicadores, filtre informações e exporte os dados da central de suporte."
        />

        <Grid
          container
          spacing={2}
        >
          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 2.4,
            }}
          >
            <StatCard
              title="Total de chamados"
              value={
                totalTickets
              }
              color="#1565c0"
              icon={
                <ConfirmationNumberOutlined />
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 2.4,
            }}
          >
            <StatCard
              title="Chamados abertos"
              value={
                openTickets
              }
              color="#ed6c02"
              icon={
                <WarningAmberOutlined />
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 2.4,
            }}
          >
            <StatCard
              title="Em andamento"
              value={
                inProgressTickets
              }
              color="#0288d1"
              icon={
                <PendingActionsOutlined />
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 2.4,
            }}
          >
            <StatCard
              title="Resolvidos"
              value={
                resolvedTickets
              }
              color="#2e7d32"
              icon={
                <CheckCircleOutline />
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 2.4,
            }}
          >
            <StatCard
              title="Críticos"
              value={
                criticalTickets
              }
              color="#d32f2f"
              icon={
                <WarningAmberOutlined />
              }
            />
          </Grid>
        </Grid>

        <ReportFilters
          filters={
            filters
          }
          onChange={
            handleFilterChange
          }
          onClear={
            handleClearFilters
          }
        />

        <ReportSlaSummary
          summary={
            slaSummary
          }
        />

        <TechnicianReportTable
          items={
            technicianReport
          }
        />

        <StoreReportTable
          items={
            storeReport
          }
        />

        <CategoryReportTable
          items={
            categoryReport
          }
        />

        <ReportActions
          onExportPdf={
            handleExportPdf
          }
          onExportExcel={
            handleExportExcel
          }
          onExportCsv={
            handleExportCsv
          }
          onPrint={
            handlePrint
          }
        />

        <ReportTable
          tickets={
            filteredTickets
          }
          users={
            users
          }
          onView={(
            ticketId
          ) =>
            navigate(
              `/tickets/${ticketId}`
            )
          }
        />
      </Stack>
    </MainLayout>
  );
}

export default ReportsPage;