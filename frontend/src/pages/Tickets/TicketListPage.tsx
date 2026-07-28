import {
  Button,
  Paper,
  Stack,
} from "@mui/material";

import {
  Clear,
} from "@mui/icons-material";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Permissions,
} from "../../auth/permissions";

import PageHeader from "../../components/common/PageHeader";
import MainLayout from "../../components/layout/MainLayout";
import TicketTable from "../../components/tables/TicketTable";
import TicketFilters from "../../components/tickets/TicketFilters";
import TicketPagination from "../../components/tickets/TicketPagination";
import TicketStatistics from "../../components/tickets/TicketStatistics";

import {
  usePermissions,
  useTicketFilters,
  useTicketPagination,
  useTicketSorting,
  useTicketStatistics,
} from "../../hooks";

import {
  getTickets,
} from "../../services/ticketService";

import {
  getUsers,
} from "../../services/userService";

export default function TicketListPage() {
  const navigate = useNavigate();

  const { can } = usePermissions();

  const canCreate = can(
    Permissions.tickets.create
  );

  const canView = can(
    Permissions.tickets.view
  );

  const [tickets] = useState(() =>
    getTickets()
  );

  const [users] = useState(() =>
    getUsers()
  );

  const technicians = useMemo(() => {
    return users
      .filter(
        (user) =>
          user.role === "Técnico"
      )
      .sort(
        (
          firstUser,
          secondUser
        ) =>
          firstUser.name.localeCompare(
            secondUser.name,
            "pt-BR"
          )
      );
  }, [users]);

  const getTechnicianName =
    useCallback(
      (
        technicianId: number | null
      ): string => {
        if (technicianId === null) {
          return "Não atribuído";
        }

        const technician = users.find(
          (user) =>
            user.id === technicianId
        );

        if (!technician) {
          return `Técnico não encontrado (#${technicianId})`;
        }

        if (
          technician.status === "Inativo"
        ) {
          return `${technician.name} — Inativo`;
        }

        return technician.name;
      },
      [users]
    );

  const {
    filteredTickets,
    categories,

    searchTerm,
    statusFilter,
    priorityFilter,
    categoryFilter,
    technicianFilter,

    hasActiveFilters,

    setSearchTerm,
    setStatusFilter,
    setPriorityFilter,
    setCategoryFilter,
    setTechnicianFilter,

    clearFilters,
  } = useTicketFilters(tickets);

  const {
    sortedTickets,
    sortField,
    sortDirection,
    handleSort,
  } = useTicketSorting(
    filteredTickets,
    getTechnicianName
  );

  const {
    page,
    rowsPerPage,
    paginatedItems:
      paginatedTickets,
    handlePageChange,
    handleRowsPerPageChange,
  } = useTicketPagination(
    sortedTickets
  );

  const {
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
  } = useTicketStatistics(tickets);

  function handleViewTicket(
    ticketId: number
  ): void {
    if (!canView) {
      return;
    }

    navigate(`/tickets/${ticketId}`);
  }

  return (
    <MainLayout title="Chamados">
      <Stack spacing={3}>
        <PageHeader
          title="Lista de chamados"
          subtitle="Gerencie, acompanhe e consulte os chamados cadastrados."
          buttonLabel={
            canCreate
              ? "Novo chamado"
              : undefined
          }
          onButtonClick={
            canCreate
              ? () =>
                  navigate(
                    "/tickets/new"
                  )
              : undefined
          }
        />

        <TicketStatistics
          totalTickets={totalTickets}
          openTickets={openTickets}
          inProgressTickets={
            inProgressTickets
          }
          resolvedTickets={
            resolvedTickets
          }
        />

        <TicketFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          priorityFilter={
            priorityFilter
          }
          categoryFilter={
            categoryFilter
          }
          technicianFilter={
            technicianFilter
          }
          categories={categories}
          technicians={technicians}
          filteredTicketsCount={
            filteredTickets.length
          }
          hasActiveFilters={
            hasActiveFilters
          }
          setSearchTerm={
            setSearchTerm
          }
          setStatusFilter={
            setStatusFilter
          }
          setPriorityFilter={
            setPriorityFilter
          }
          setCategoryFilter={
            setCategoryFilter
          }
          setTechnicianFilter={
            setTechnicianFilter
          }
          clearFilters={
            clearFilters
          }
        />

        <Paper
          sx={{
            overflow: "hidden",
          }}
        >
          <Stack spacing={0}>
            <TicketTable
              tickets={
                paginatedTickets
              }
              sortField={sortField}
              sortDirection={
                sortDirection
              }
              getTechnicianName={
                getTechnicianName
              }
              onSort={handleSort}
              onView={
                canView
                  ? handleViewTicket
                  : undefined
              }
            />

            {filteredTickets.length ===
              0 &&
              hasActiveFilters && (
                <Button
                  variant="text"
                  startIcon={<Clear />}
                  onClick={clearFilters}
                  sx={{
                    alignSelf:
                      "center",
                    my: 2,
                  }}
                >
                  Limpar filtros
                </Button>
              )}

            <TicketPagination
              count={
                filteredTickets.length
              }
              page={page}
              rowsPerPage={
                rowsPerPage
              }
              onPageChange={
                handlePageChange
              }
              onRowsPerPageChange={
                handleRowsPerPageChange
              }
            />
          </Stack>
        </Paper>
      </Stack>
    </MainLayout>
  );
}