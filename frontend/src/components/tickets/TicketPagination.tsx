import {
  TablePagination,
} from "@mui/material";

import type {
  ChangeEvent,
} from "react";

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
  if (count === 0) {
    return null;
  }

  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      onRowsPerPageChange={
        onRowsPerPageChange
      }
      rowsPerPageOptions={[
        5,
        10,
        25,
      ]}
      labelRowsPerPage="Chamados por página:"
      labelDisplayedRows={({
        from,
        to,
        count: totalCount,
      }) =>
        `${from}–${to} de ${totalCount}`
      }
      sx={{
        borderTop: 1,
        borderColor: "divider",
      }}
    />
  );
}