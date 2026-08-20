import {
  TablePagination,
} from "@mui/material";

import type {
  ChangeEvent,
} from "react";

interface DataTablePaginationProps {
  count: number;

  page: number;

  rowsPerPage: number;

  label?: string;

  onPageChange: (
    event: unknown,
    newPage: number
  ) => void;

  onRowsPerPageChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
}

export default function DataTablePagination({
  count,
  page,
  rowsPerPage,
  label = "Itens por página:",
  onPageChange,
  onRowsPerPageChange,
}: DataTablePaginationProps) {
  if (count === 0) {
    return null;
  }

  function handleRowsPerPageChange(
    event: ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement
    >
  ): void {
    onRowsPerPageChange(
      event as ChangeEvent<HTMLInputElement>
    );
  }

  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={
        onPageChange
      }
      onRowsPerPageChange={
        handleRowsPerPageChange
      }
      rowsPerPageOptions={[
        5,
        10,
        25,
      ]}
      labelRowsPerPage={
        label
      }
      labelDisplayedRows={({
        from,
        to,
        count: totalCount,
      }) =>
        `${from}–${to} de ${totalCount}`
      }
      sx={{
        borderTop: 1,
        borderColor:
          "divider",
      }}
    />
  );
}