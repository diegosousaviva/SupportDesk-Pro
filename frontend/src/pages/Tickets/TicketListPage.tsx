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
  useAuth,
} from "../../contexts/AuthContext";

import {
  usePermissions,
  useTicketFilters,
  useTicketPagination,
  useTicketSorting,
  useTicketStatistics,
} from "../../hooks";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

import {
  deleteTicket,
  getTickets,
} from "../../services/ticketService";

import {
  getUsers,
} from "../../services/userService";

import type {
  Ticket,
} from "../../types/Ticket";

export default function TicketListPage() {
  const navigate =
    useNavigate();

  const {
    user,
  } = useAuth();

  const {
    can,
  } = usePermissions();

  const {
    showSnackbar,
  } = useSnackbar();

  const canCreate =
    can(
      Permissions.tickets.create
    );

  const canView =
    can(
      Permissions.tickets.view
    );

  const canViewAll =
    can(
      Permissions.tickets.viewAll
    );

  const canViewAssigned =
    can(
      Permissions.tickets.viewAssigned
    );

  const canViewOwn =
    can(
      Permissions.tickets.viewOwn
    );

  const canEdit =
    can(
      Permissions.tickets.edit
    );

  const canEditOwn =
    can(
      Permissions.tickets.editOwn
    );

  const canDelete =
    can(
      Permissions.tickets.delete
    );

  const [
    tickets,
    setTickets,
  ] = useState(() =>
    getTickets()
  );

  const [
    users,
  ] = useState(() =>
    getUsers()
  );

  /*
   * Define quais chamados o usuário atual pode
   * realmente visualizar.
   *
   * Administrador:
   *   viewAll -> todos os chamados.
   *
   * Técnico:
   *   viewAssigned -> somente chamados atribuídos a ele.
   *
   * Solicitante:
   *   viewOwn -> somente chamados criados por ele.
   */
  const accessibleTickets =
    useMemo<Ticket[]>(() => {
      if (
        !user ||
        !canView
      ) {
        return [];
      }

      if (
        canViewAll
      ) {
        return tickets;
      }

      return tickets.filter(
        (ticket) => {
          const isAssignedToCurrentUser =
            canViewAssigned &&
            ticket.assignedTechnicianId ===
              user.id;

          const isOwnedByCurrentUser =
            canViewOwn &&
            ticket.requesterUserId ===
              user.id;

          return (
            isAssignedToCurrentUser ||
            isOwnedByCurrentUser
          );
        }
      );
    }, [
      tickets,
      user,
      canView,
      canViewAll,
      canViewAssigned,
      canViewOwn,
    ]);

  const technicians =
    useMemo(() => {
      return users
        .filter(
          (currentUser) =>
            currentUser.role ===
            "Técnico"
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
    }, [
      users,
    ]);

  const getTechnicianName =
    useCallback(
      (
        technicianId:
          number | null
      ): string => {
        if (
          technicianId ===
          null
        ) {
          return "Não atribuído";
        }

        const technician =
          users.find(
            (currentUser) =>
              currentUser.id ===
              technicianId
          );

        if (
          !technician
        ) {
          return `Técnico não encontrado (#${technicianId})`;
        }

        if (
          technician.status ===
          "Inativo"
        ) {
          return `${technician.name} — Inativo`;
        }

        return technician.name;
      },
      [
        users,
      ]
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
  } = useTicketFilters(
    accessibleTickets
  );

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
  } = useTicketStatistics(
    accessibleTickets
  );

  function canAccessTicket(
    ticket:
      Ticket
  ): boolean {
    if (
      !user ||
      !canView
    ) {
      return false;
    }

    if (
      canViewAll
    ) {
      return true;
    }

    if (
      canViewAssigned &&
      ticket.assignedTechnicianId ===
        user.id
    ) {
      return true;
    }

    if (
      canViewOwn &&
      ticket.requesterUserId ===
        user.id
    ) {
      return true;
    }

    return false;
  }

  function canEditTicket(
    ticket:
      Ticket
  ): boolean {
    if (
      canEdit
    ) {
      return true;
    }

    if (
      !user
    ) {
      return false;
    }

    return (
      canEditOwn &&
      ticket.requesterUserId ===
        user.id
    );
  }

  function handleViewTicket(
    ticketId: number
  ): void {
    const ticket =
      tickets.find(
        (currentTicket) =>
          currentTicket.id ===
          ticketId
      );

    if (
      !ticket ||
      !canAccessTicket(
        ticket
      )
    ) {
      showSnackbar(
        "Você não possui permissão para visualizar este chamado.",
        {
          severity:
            "warning",
        }
      );

      return;
    }

    navigate(
      `/tickets/${ticketId}`
    );
  }

  function handleEditTicket(
    ticketId: number
  ): void {
    const ticket =
      tickets.find(
        (currentTicket) =>
          currentTicket.id ===
          ticketId
      );

    if (
      !ticket ||
      !canEditTicket(
        ticket
      )
    ) {
      showSnackbar(
        "Você não possui permissão para editar este chamado.",
        {
          severity:
            "warning",
        }
      );

      return;
    }

    navigate(
      `/tickets/${ticketId}/edit`
    );
  }

  function handleDeleteTicket(
    ticketId: number
  ): void {
    if (
      !canDelete
    ) {
      return;
    }

    const ticket =
      tickets.find(
        (currentTicket) =>
          currentTicket.id ===
          ticketId
      );

    if (
      !ticket
    ) {
      showSnackbar(
        "O chamado não foi encontrado.",
        {
          severity:
            "error",
        }
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Deseja realmente excluir o chamado #${ticket.id} — ${ticket.title}?`
      );

    if (
      !confirmed
    ) {
      return;
    }

    try {
      const deleted =
        deleteTicket(
          ticketId
        );

      if (
        !deleted
      ) {
        throw new Error(
          "Não foi possível excluir o chamado."
        );
      }

      setTickets(
        getTickets()
      );

      showSnackbar(
        `Chamado #${ticket.id} excluído com sucesso.`,
        {
          severity:
            "success",
        }
      );
    } catch (error) {
      console.error(
        "Não foi possível excluir o chamado.",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o chamado. Tente novamente.";

      showSnackbar(
        message,
        {
          severity:
            "error",
        }
      );
    }
  }

  const canShowEditAction =
    canEdit ||
    canEditOwn;

  return (
    <MainLayout title="Chamados">
      <Stack spacing={3}>
        <PageHeader
          title="Lista de chamados"
          subtitle={
            canViewAll
              ? "Gerencie, acompanhe e consulte os chamados cadastrados."
              : canViewAssigned
                ? "Acompanhe os chamados atribuídos a você."
                : canViewOwn
                  ? "Acompanhe os chamados abertos por você."
                  : "Consulte os chamados disponíveis."
          }
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
          totalTickets={
            totalTickets
          }
          openTickets={
            openTickets
          }
          inProgressTickets={
            inProgressTickets
          }
          resolvedTickets={
            resolvedTickets
          }
        />

        <TicketFilters
          searchTerm={
            searchTerm
          }
          statusFilter={
            statusFilter
          }
          priorityFilter={
            priorityFilter
          }
          categoryFilter={
            categoryFilter
          }
          technicianFilter={
            technicianFilter
          }
          categories={
            categories
          }
          technicians={
            technicians
          }
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
            overflow:
              "hidden",
          }}
        >
          <Stack spacing={0}>
            <TicketTable
              tickets={
                paginatedTickets
              }
              sortField={
                sortField
              }
              sortDirection={
                sortDirection
              }
              getTechnicianName={
                getTechnicianName
              }
              onSort={
                handleSort
              }
              onView={
                canView
                  ? handleViewTicket
                  : undefined
              }
              onEdit={
                canShowEditAction
                  ? handleEditTicket
                  : undefined
              }
              onDelete={
                canDelete
                  ? handleDeleteTicket
                  : undefined
              }
            />

            {filteredTickets.length ===
              0 &&
              hasActiveFilters && (
                <Button
                  variant="text"
                  startIcon={
                    <Clear />
                  }
                  onClick={
                    clearFilters
                  }
                  sx={{
                    alignSelf:
                      "center",

                    my:
                      2,
                  }}
                >
                  Limpar filtros
                </Button>
              )}

            <TicketPagination
              count={
                filteredTickets.length
              }
              page={
                page
              }
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