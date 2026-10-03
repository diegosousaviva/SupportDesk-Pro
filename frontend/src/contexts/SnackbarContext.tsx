import {
  Alert,
  Snackbar,
} from "@mui/material";

import type { AlertColor, SnackbarCloseReason } from "@mui/material";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";
import { SnackbarContext } from "./SnackbarContextValue";
import type { SnackbarContextValue, SnackbarOptions } from "./SnackbarContextValue";

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

export function SnackbarProvider({
  children,
}: SnackbarProviderProps) {
  const [
    snackbar,
    setSnackbar,
  ] =
    useState<SnackbarState>({
      open: false,
      message: "",
      severity: "success",
      duration: DEFAULT_DURATION,
    });

  const showSnackbar =
    useCallback(
      (
        message: string,
        options?: SnackbarOptions
      ): void => {
        const normalizedMessage =
          message.trim();

        if (!normalizedMessage) {
          return;
        }

        setSnackbar({
          open: true,
          message:
            normalizedMessage,
          severity:
            options?.severity ??
            "success",
          duration:
            options?.duration ??
            DEFAULT_DURATION,
        });
      },
      []
    );

  const showSuccess =
    useCallback(
      (
        message: string,
        duration?: number
      ): void => {
        showSnackbar(
          message,
          {
            severity:
              "success",

            duration,
          }
        );
      },
      [
        showSnackbar,
      ]
    );

  const showError =
    useCallback(
      (
        message: string,
        duration?: number
      ): void => {
        showSnackbar(
          message,
          {
            severity:
              "error",

            duration,
          }
        );
      },
      [
        showSnackbar,
      ]
    );

  const closeSnackbar =
    useCallback(
      (): void => {
        setSnackbar(
          (
            currentSnackbar
          ) => ({
            ...currentSnackbar,

            open:
              false,
          })
        );
      },
      []
    );

  const handleClose =
    useCallback(
      (
        _event:
          | React.SyntheticEvent
          | Event,
        reason?:
          SnackbarCloseReason
      ): void => {
        if (
          reason ===
          "clickaway"
        ) {
          return;
        }

        closeSnackbar();
      },
      [
        closeSnackbar,
      ]
    );

  const contextValue =
    useMemo<SnackbarContextValue>(
      () => ({
        showSnackbar,

        showSuccess,

        showError,

        closeSnackbar,
      }),
      [
        showSnackbar,
        showSuccess,
        showError,
        closeSnackbar,
      ]
    );

  return (
    <SnackbarContext.Provider
      value={
        contextValue
      }
    >
      {children}

      <Snackbar
        open={
          snackbar.open
        }
        autoHideDuration={
          snackbar.duration
        }
        onClose={
          handleClose
        }
        anchorOrigin={{
          vertical:
            "bottom",

          horizontal:
            "right",
        }}
      >
        <Alert
          onClose={
            handleClose
          }
          severity={
            snackbar.severity
          }
          variant="filled"
          elevation={6}
          sx={{
            width:
              "100%",

            minWidth: {
              xs:
                "auto",

              sm:
                320,
            },
          }}
        >
          {
            snackbar.message
          }
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}
