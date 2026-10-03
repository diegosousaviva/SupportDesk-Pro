import {
  useCallback,
  useMemo,
  useState,
} from "react";

import type {
  ChangeEvent,
} from "react";

export interface UseTicketPaginationResult<T> {
  page: number;

  rowsPerPage: number;

  paginatedItems: T[];

  handlePageChange: (
    event: unknown,
    newPage: number
  ) => void;

  handleRowsPerPageChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
}

export function useTicketPagination<T>(
  items: readonly T[],
  defaultRowsPerPage = 10
): UseTicketPaginationResult<T> {
  const [page, setPage] = useState(0);

  const [
    rowsPerPage,
    setRowsPerPage,
  ] = useState(defaultRowsPerPage);

  const maximumPage = Math.max(
    0,
    Math.ceil(items.length / rowsPerPage) - 1
  );
  const visiblePage = Math.min(page, maximumPage);

  const paginatedItems = useMemo(() => {
    const firstIndex =
      visiblePage * rowsPerPage;

    return items.slice(
      firstIndex,
      firstIndex +
        rowsPerPage
    );
  }, [
    items,
    visiblePage,
    rowsPerPage,
  ]);

  const handlePageChange =
    useCallback(
      (
        _event: unknown,
        newPage: number
      ): void => {
        setPage(newPage);
      },
      []
    );

  const handleRowsPerPageChange =
    useCallback(
      (
        event: ChangeEvent<HTMLInputElement>
      ): void => {
        setRowsPerPage(
          Number.parseInt(
            event.target.value,
            10
          )
        );

        setPage(0);
      },
      []
    );

  return {
    page: visiblePage,
    rowsPerPage,
    paginatedItems,
    handlePageChange,
    handleRowsPerPageChange,
  };
}
