import {
  createContext,
  useContext,
} from "react";

import type {
  PaletteMode,
} from "@mui/material";

export type ColorModePreference =
  | "light"
  | "dark"
  | "system";

interface ColorModeContextData {
  mode: PaletteMode;
  preference: ColorModePreference;
  setColorMode: (
    preference: ColorModePreference
  ) => void;
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<
  ColorModeContextData | undefined
>(undefined);

export function useColorMode(): ColorModeContextData {
  const context = useContext(ColorModeContext);

  if (!context) {
    throw new Error(
      "useColorMode deve ser usado dentro de ColorModeContext.Provider"
    );
  }

  return context;
}

export default ColorModeContext;