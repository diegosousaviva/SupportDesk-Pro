import { useContext } from "react";
import ColorModeContext from "../contexts/ColorModeContext";
import type { ColorModePreference } from "../contexts/ColorModeContext";

export function useColorMode() {
  const context = useContext(ColorModeContext);
  if (!context) throw new Error("useColorMode deve ser usado dentro de ColorModeContext.Provider");
  return context;
}

export type { ColorModePreference };
