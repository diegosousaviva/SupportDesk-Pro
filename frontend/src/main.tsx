import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import ReactDOM from "react-dom/client";

import {
  CssBaseline,
  ThemeProvider,
} from "@mui/material";

import type {
  PaletteMode,
} from "@mui/material";

import App from "./App";

import {
  createAppTheme,
} from "./theme/theme";

import ColorModeContext from "./contexts/ColorModeContext";

import type {
  ColorModePreference,
} from "./contexts/ColorModeContext";

import {
  AuthProvider,
} from "./contexts/AuthContext";

import {
  NotificationProvider,
} from "./contexts/NotificationContext";

import {
  SnackbarProvider,
} from "./contexts/SnackbarContext";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

const COLOR_MODE_STORAGE_KEY =
  "supportdesk-pro-color-mode";

function getSystemMode(): PaletteMode {
  return window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches
    ? "dark"
    : "light";
}

function loadColorModePreference():
  ColorModePreference {
  const savedPreference =
    localStorage.getItem(
      COLOR_MODE_STORAGE_KEY
    );

  if (
    savedPreference === "light" ||
    savedPreference === "dark" ||
    savedPreference === "system"
  ) {
    return savedPreference;
  }

  return "light";
}

function Root() {
  const [
    preference,
    setPreference,
  ] = useState<ColorModePreference>(
    loadColorModePreference
  );

  const [
    systemMode,
    setSystemMode,
  ] = useState<PaletteMode>(
    getSystemMode
  );

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    function handleSystemThemeChange(
      event: MediaQueryListEvent
    ): void {
      setSystemMode(
        event.matches
          ? "dark"
          : "light"
      );
    }

    mediaQuery.addEventListener(
      "change",
      handleSystemThemeChange
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange
      );
    };
  }, []);

  const mode: PaletteMode =
    preference === "system"
      ? systemMode
      : preference;

  const colorMode =
    useMemo(
      () => ({
        mode,
        preference,

        setColorMode: (
          newPreference:
            ColorModePreference
        ) => {
          setPreference(
            newPreference
          );

          localStorage.setItem(
            COLOR_MODE_STORAGE_KEY,
            newPreference
          );
        },

        toggleColorMode: () => {
          const newPreference:
            ColorModePreference =
              mode === "light"
                ? "dark"
                : "light";

          setPreference(
            newPreference
          );

          localStorage.setItem(
            COLOR_MODE_STORAGE_KEY,
            newPreference
          );
        },
      }),
      [
        mode,
        preference,
      ]
    );

  const theme =
    useMemo(
      () =>
        createAppTheme(
          mode
        ),
      [mode]
    );

  return (
    <ColorModeContext.Provider
      value={colorMode}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <SnackbarProvider>
          <AuthProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

ReactDOM.createRoot(
  document.getElementById(
    "root"
  )!
).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);