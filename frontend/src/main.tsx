import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom/client";

import {
  CssBaseline,
  ThemeProvider,
} from "@mui/material";

import type { PaletteMode } from "@mui/material";

import App from "./App";
import { createAppTheme } from "./theme/theme";
import ColorModeContext from "./contexts/ColorModeContext";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

const COLOR_MODE_STORAGE_KEY =
  "supportdesk-pro-color-mode";

function Root() {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem(
      COLOR_MODE_STORAGE_KEY
    );

    if (savedMode === "dark" || savedMode === "light") {
      return savedMode;
    }

    return "light";
  });

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((currentMode) => {
          const newMode =
            currentMode === "light" ? "dark" : "light";

          localStorage.setItem(
            COLOR_MODE_STORAGE_KEY,
            newMode
          );

          return newMode;
        });
      },
    }),
    [mode]
  );

  const theme = useMemo(
    () => createAppTheme(mode),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <App />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);