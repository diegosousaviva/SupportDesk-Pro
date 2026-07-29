import { useContext } from "react";

import {
  SnackbarContext,
} from "../contexts/SnackbarContext";

import type {
  SnackbarContextValue,
} from "../contexts/SnackbarContext";

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