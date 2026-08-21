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
  LanguageProvider,
} from "./contexts/LanguageContext";

import {
  NotificationProvider,
} from "./contexts/NotificationContext";

import {
  SnackbarProvider,
} from "./contexts/SnackbarContext";

import GlobalErrorBoundary from "./components/common/GlobalErrorBoundary";

import {
  getSettings,
  saveSettings,
} from "./services/settingsService";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

function getSystemMode():
  PaletteMode {
  return window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches
    ? "dark"
    : "light";
}

function loadColorModePreference():
  ColorModePreference {
  return getSettings()
    .preferredTheme;
}

function Root() {
  const [
    preference,
    setPreference,
  ] =
    useState<ColorModePreference>(
      loadColorModePreference
    );

  const [
    systemMode,
    setSystemMode,
  ] =
    useState<PaletteMode>(
      getSystemMode
    );

  const [
    settingsVersion,
    setSettingsVersion,
  ] =
    useState(
      0
    );

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    function handleSystemThemeChange(
      event:
        MediaQueryListEvent
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

  const mode:
    PaletteMode =
      preference ===
      "system"
        ? systemMode
        : preference;

  const compactMode =
    useMemo(
      () =>
        getSettings()
          .compactMode,
      [
        settingsVersion,
      ]
    );

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

          const currentSettings =
            getSettings();

          saveSettings({
            ...currentSettings,

            preferredTheme:
              newPreference,
          });

          setSettingsVersion(
            (
              currentVersion
            ) =>
              currentVersion +
              1
          );
        },

        toggleColorMode:
          () => {
            const newPreference:
              ColorModePreference =
                mode ===
                "light"
                  ? "dark"
                  : "light";

            setPreference(
              newPreference
            );

            const currentSettings =
              getSettings();

            saveSettings({
              ...currentSettings,

              preferredTheme:
                newPreference,
            });

            setSettingsVersion(
              (
                currentVersion
              ) =>
                currentVersion +
                1
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
          mode,
          compactMode
        ),
      [
        mode,
        compactMode,
      ]
    );

  return (
    <ColorModeContext.Provider
      value={
        colorMode
      }
    >
      <ThemeProvider
        theme={
          theme
        }
      >
        <CssBaseline />

        <GlobalErrorBoundary>
          <SnackbarProvider>
            <AuthProvider>
              <LanguageProvider>
                <NotificationProvider>
                  <App />
                </NotificationProvider>
              </LanguageProvider>
            </AuthProvider>
          </SnackbarProvider>
        </GlobalErrorBoundary>
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