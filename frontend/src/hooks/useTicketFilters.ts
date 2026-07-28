import {
  useCallback,
  useMemo,
  useState,
} from "react";

import type {
  Dispatch,
  SetStateAction,
} from "react";

import {
  ALL_CATEGORIES_VALUE,
  ALL_PRIORITIES_VALUE,
  ALL_STATUS_VALUE,
  ALL_TECHNICIANS_VALUE,
  UNASSIGNED_TECHNICIAN_VALUE,
} from "../constants/ticketFilters";

import type {
  Ticket,
} from "../types/Ticket";

export type TicketStatusFilter =
  | Ticket["status"]
  | typeof ALL_STATUS_VALUE;

export type TicketPriorityFilter =
  | Ticket["priority"]
  | typeof ALL_PRIORITIES_VALUE;

export type TicketCategoryFilter = string;

export type TicketTechnicianFilter = string;

export interface UseTicketFiltersResult {
  filteredTickets: Ticket[];

  categories: string[];

  searchTerm: string;

  statusFilter: TicketStatusFilter;

  priorityFilter: TicketPriorityFilter;

  categoryFilter: TicketCategoryFilter;

  technicianFilter: TicketTechnicianFilter;

  hasActiveFilters: boolean;

  setSearchTerm: Dispatch<
    SetStateAction<string>
  >;

  setStatusFilter: Dispatch<
    SetStateAction<TicketStatusFilter>
  >;

  setPriorityFilter: Dispatch<
    SetStateAction<TicketPriorityFilter>
  >;

  setCategoryFilter: Dispatch<
    SetStateAction<TicketCategoryFilter>
  >;

  setTechnicianFilter: Dispatch<
    SetStateAction<TicketTechnicianFilter>
  >;

  clearFilters: () => void;
}

export function useTicketFilters(
  tickets: readonly Ticket[]
): UseTicketFiltersResult {
  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<TicketStatusFilter>(
      ALL_STATUS_VALUE
    );

  const [
    priorityFilter,
    setPriorityFilter,
  ] = useState<TicketPriorityFilter>(
    ALL_PRIORITIES_VALUE
  );

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState<TicketCategoryFilter>(
    ALL_CATEGORIES_VALUE
  );

  const [
    technicianFilter,
    setTechnicianFilter,
  ] = useState<TicketTechnicianFilter>(
    ALL_TECHNICIANS_VALUE
  );

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        tickets
          .map((ticket) =>
            ticket.category.trim()
          )
          .filter(Boolean)
      )
    ).sort(
      (
        firstCategory,
        secondCategory
      ) =>
        firstCategory.localeCompare(
          secondCategory,
          "pt-BR"
        )
    );
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    return tickets.filter((ticket) => {
      const matchesSearch =
        normalizedSearch === "" ||
        ticket.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        ticket.description
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(ticket.id).includes(
          normalizedSearch
        );

      const matchesStatus =
        statusFilter ===
          ALL_STATUS_VALUE ||
        ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter ===
          ALL_PRIORITIES_VALUE ||
        ticket.priority ===
          priorityFilter;

      const matchesCategory =
        categoryFilter ===
          ALL_CATEGORIES_VALUE ||
        ticket.category === categoryFilter;

      const matchesTechnician =
        technicianFilter ===
          ALL_TECHNICIANS_VALUE ||
        (technicianFilter ===
          UNASSIGNED_TECHNICIAN_VALUE &&
          ticket.assignedTechnicianId ===
            null) ||
        (ticket.assignedTechnicianId !==
          null &&
          String(
            ticket.assignedTechnicianId
          ) === technicianFilter);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory &&
        matchesTechnician
      );
    });
  }, [
    categoryFilter,
    priorityFilter,
    searchTerm,
    statusFilter,
    technicianFilter,
    tickets,
  ]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    statusFilter !== ALL_STATUS_VALUE ||
    priorityFilter !==
      ALL_PRIORITIES_VALUE ||
    categoryFilter !==
      ALL_CATEGORIES_VALUE ||
    technicianFilter !==
      ALL_TECHNICIANS_VALUE;

  const clearFilters =
    useCallback((): void => {
      setSearchTerm("");

      setStatusFilter(
        ALL_STATUS_VALUE
      );

      setPriorityFilter(
        ALL_PRIORITIES_VALUE
      );

      setCategoryFilter(
        ALL_CATEGORIES_VALUE
      );

      setTechnicianFilter(
        ALL_TECHNICIANS_VALUE
      );
    }, []);

  return {
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
  };
}