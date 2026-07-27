import { createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";

export function createAppTheme(mode: PaletteMode) {
  const isDarkMode = mode === "dark";

  return createTheme({
    palette: {
      mode,

      primary: {
        main: isDarkMode ? "#42a5f5" : "#1565c0",
        light: isDarkMode ? "#80d6ff" : "#5e92f3",
        dark: isDarkMode ? "#0077c2" : "#003c8f",
        contrastText: "#ffffff",
      },

      secondary: {
        main: isDarkMode ? "#26c6da" : "#00acc1",
      },

      background: {
        default: isDarkMode ? "#0f172a" : "#f4f6f8",
        paper: isDarkMode ? "#1e293b" : "#ffffff",
      },

      text: {
        primary: isDarkMode ? "#f8fafc" : "#1f2937",
        secondary: isDarkMode ? "#94a3b8" : "#64748b",
      },

      divider: isDarkMode
        ? "rgba(148, 163, 184, 0.18)"
        : "rgba(15, 23, 42, 0.12)",
    },

    typography: {
      fontFamily: "Roboto, Arial, sans-serif",

      h4: {
        fontWeight: 700,
      },

      h5: {
        fontWeight: 600,
      },

      h6: {
        fontWeight: 600,
      },

      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },

    shape: {
      borderRadius: 10,
    },

    transitions: {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition:
              "background-color 250ms ease, color 250ms ease",
          },

          "*": {
            boxSizing: "border-box",
          },

          "*::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },

          "*::-webkit-scrollbar-thumb": {
            backgroundColor: isDarkMode
              ? "rgba(148, 163, 184, 0.35)"
              : "rgba(100, 116, 139, 0.35)",
            borderRadius: "10px",
          },

          "*::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: "10px 18px",
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            transition:
              "background-color 250ms ease, border-color 250ms ease, box-shadow 250ms ease",
          },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
          },
        },
      },

      MuiTextField: {
        defaultProps: {
          variant: "outlined",
        },
      },

      MuiTooltip: {
        defaultProps: {
          arrow: true,
        },
      },
    },
  });
}

export default createAppTheme;