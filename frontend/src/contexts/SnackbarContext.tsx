import {
  Alert,
  Snackbar,
} from "@mui/material";

import type {
  AlertColor,
  SnackbarCloseReason,
} from "@mui/material";

import {
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

export interface SnackbarOptions {
  severity?: AlertColor;
  duration?: number;
}

export interface SnackbarContextValue {
  showSnackbar: (
    message: string,
    options?: SnackbarOptions
  ) => void;

  closeSnackbar: () => void;
}

interface SnackbarProviderProps {
  children: ReactNode;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
  duration: number;
}

const DEFAULT_DURATION = 4000;

export const SnackbarContext =
  createContext<SnackbarContextValue | null>(
    null
  );

export function SnackbarProvider({
  children,
}: SnackbarProviderProps) {
  const [snackbar, setSnackbar] =
    useState<SnackbarState>({
      open: false,
      message: "",
      severity: "success",
      duration: DEFAULT_DURATION,
    });

  const showSnackbar = useCallback(
    (
      message: string,
      options?: SnackbarOptions
    ): void => {
      const normalizedMessage = message.trim();

      if (!normalizedMessage) {
        return;
      }

      setSnackbar({
        open: true,
        message: normalizedMessage,
        severity:
          options?.severity ?? "success",
        duration:
          options?.duration ??
          DEFAULT_DURATION,
      });
    },
    []
  );

  const closeSnackbar =
    useCallback((): void => {
      setSnackbar((currentSnackbar) => ({
        ...currentSnackbar,
        open: false,
      }));
    }, []);

  const handleClose = useCallback(
    (
      _event:
        | React.SyntheticEvent
        | Event,
      reason?: SnackbarCloseReason
    ): void => {
      if (reason === "clickaway") {
        return;
      }

      closeSnackbar();
    },
    [closeSnackbar]
  );

  const contextValue =
    useMemo<SnackbarContextValue>(
      () => ({
        showSnackbar,
        closeSnackbar,
      }),
      [
        showSnackbar,
        closeSnackbar,
      ]
    );

  return (
    <SnackbarContext.Provider
      value={contextValue}
    >
      {children}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={
          snackbar.duration
        }
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
          sx={{
            width: "100%",
            minWidth: {
              xs: "auto",
              sm: 320,
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}