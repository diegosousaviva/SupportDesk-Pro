import { useContext } from "react";

import {
  SnackbarContext,
} from "../contexts/SnackbarContextValue";

import type {
  SnackbarContextValue,
} from "../contexts/SnackbarContextValue";

export function useSnackbar():
  SnackbarContextValue {
  const context = useContext(
    SnackbarContext
  );

  if (!context) {
    throw new Error(
      "useSnackbar deve ser utilizado dentro de SnackbarProvider."
    );
  }

  return context;
}
