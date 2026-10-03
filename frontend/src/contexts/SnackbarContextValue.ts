import { createContext } from "react";
import type { AlertColor } from "@mui/material";

export interface SnackbarOptions {
  severity?: AlertColor;
  duration?: number;
}

export interface SnackbarContextValue {
  showSnackbar: (message: string, options?: SnackbarOptions) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  closeSnackbar: () => void;
}

export const SnackbarContext = createContext<SnackbarContextValue | null>(null);
