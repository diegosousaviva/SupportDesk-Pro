import {
  createTheme,
} from "@mui/material/styles";

import type {
  PaletteMode,
} from "@mui/material";

export function createAppTheme(
  mode: PaletteMode,
  compactMode = false
) {
  const isDarkMode =
    mode === "dark";

  return createTheme({
    palette: {
      mode,

      primary: {
        main:
          isDarkMode
            ? "#42a5f5"
            : "#1565c0",

        light:
          isDarkMode
            ? "#80d6ff"
            : "#5e92f3",

        dark:
          isDarkMode
            ? "#0077c2"
            : "#003c8f",

        contrastText:
          "#ffffff",
      },

      secondary: {
        main:
          isDarkMode
            ? "#26c6da"
            : "#00acc1",
      },

      background: {
        default:
          isDarkMode
            ? "#0f172a"
            : "#f4f6f8",

        paper:
          isDarkMode
            ? "#1e293b"
            : "#ffffff",
      },

      text: {
        primary:
          isDarkMode
            ? "#f8fafc"
            : "#1f2937",

        secondary:
          isDarkMode
            ? "#94a3b8"
            : "#64748b",
      },

      divider:
        isDarkMode
          ? "rgba(148, 163, 184, 0.18)"
          : "rgba(15, 23, 42, 0.12)",
    },

    typography: {
      fontFamily:
        "Roboto, Arial, sans-serif",

      h4: {
        fontWeight:
          700,
      },

      h5: {
        fontWeight:
          600,
      },

      h6: {
        fontWeight:
          600,
      },

      button: {
        textTransform:
          "none",

        fontWeight:
          600,
      },
    },

    shape: {
      borderRadius:
        compactMode
          ? 8
          : 10,
    },

    transitions: {
      duration: {
        shortest:
          150,

        shorter:
          200,

        short:
          250,

        standard:
          300,

        complex:
          375,

        enteringScreen:
          225,

        leavingScreen:
          195,
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
            boxSizing:
              "border-box",
          },

          "*::-webkit-scrollbar": {
            width:
              compactMode
                ? "6px"
                : "8px",

            height:
              compactMode
                ? "6px"
                : "8px",
          },

          "*::-webkit-scrollbar-thumb": {
            backgroundColor:
              isDarkMode
                ? "rgba(148, 163, 184, 0.35)"
                : "rgba(100, 116, 139, 0.35)",

            borderRadius:
              "10px",
          },

          "*::-webkit-scrollbar-track": {
            backgroundColor:
              "transparent",
          },
        },
      },

      MuiButton: {
        defaultProps: {
          size:
            compactMode
              ? "small"
              : "medium",
        },

        styleOverrides: {
          root: {
            borderRadius:
              compactMode
                ? 7
                : 8,

            padding:
              compactMode
                ? "6px 12px"
                : "10px 18px",

            minHeight:
              compactMode
                ? 32
                : 40,
          },
        },
      },

      MuiIconButton: {
        defaultProps: {
          size:
            compactMode
              ? "small"
              : "medium",
        },
      },

      MuiChip: {
        defaultProps: {
          size:
            compactMode
              ? "small"
              : "medium",
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            padding:
              compactMode
                ? "8px 12px"
                : "16px",
          },

          head: {
            padding:
              compactMode
                ? "9px 12px"
                : "16px",
          },
        },
      },

      MuiToolbar: {
        styleOverrides: {
          root: {
            minHeight:
              compactMode
                ? "48px"
                : undefined,
          },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            paddingTop:
              compactMode
                ? 6
                : 8,

            paddingBottom:
              compactMode
                ? 6
                : 8,
          },
        },
      },

      MuiInputBase: {
        styleOverrides: {
          root: {
            fontSize:
              compactMode
                ? "0.875rem"
                : undefined,
          },
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          input: {
            padding:
              compactMode
                ? "10px 12px"
                : "16.5px 14px",
          },

          inputSizeSmall: {
            padding:
              compactMode
                ? "7px 10px"
                : undefined,
          },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize:
              compactMode
                ? "0.875rem"
                : undefined,
          },
        },
      },

      MuiFormControlLabel: {
        styleOverrides: {
          root: {
            marginTop:
              compactMode
                ? -2
                : undefined,

            marginBottom:
              compactMode
                ? -2
                : undefined,
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage:
              "none",

            transition:
              "background-color 250ms ease, border-color 250ms ease, box-shadow 250ms ease",
          },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage:
              "none",
          },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage:
              "none",
          },
        },
      },

      MuiTextField: {
        defaultProps: {
          variant:
            "outlined",

          size:
            compactMode
              ? "small"
              : "medium",
        },
      },

      MuiFormControl: {
        defaultProps: {
          size:
            compactMode
              ? "small"
              : "medium",
        },
      },

      MuiTooltip: {
        defaultProps: {
          arrow:
            true,
        },
      },
    },
  });
}

export default createAppTheme;