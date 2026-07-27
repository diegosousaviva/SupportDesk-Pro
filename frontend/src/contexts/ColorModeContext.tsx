import { createContext, useContext } from "react";

interface ColorModeContextData {
  mode: "light" | "dark";
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