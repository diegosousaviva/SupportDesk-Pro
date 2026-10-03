import { createContext } from "react";
import type { PaletteMode } from "@mui/material";

export type ColorModePreference = "light" | "dark" | "system";

interface ColorModeContextData {
  mode: PaletteMode;
  preference: ColorModePreference;
  setColorMode: (preference: ColorModePreference) => void;
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextData | undefined>(undefined);
export default ColorModeContext;
