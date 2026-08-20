import type {
  ChangeEvent,
} from "react";

import DataTablePagination from "../common/DataTablePagination";

interface TicketPaginationProps {
  count: number;

  page: number;

  rowsPerPage: number;

  onPageChange: (
    event: unknown,
    newPage: number
  ) => void;

  onRowsPerPageChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
}

export default function TicketPagination({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: TicketPaginationProps) {
  return (
    <DataTablePagination
      count={count}
      page={page}
      rowsPerPage={rowsPerPage}
      label="Chamados por página:"
      onPageChange={
        onPageChange
      }
      onRowsPerPageChange={
        onRowsPerPageChange
      }
    />
  );
}