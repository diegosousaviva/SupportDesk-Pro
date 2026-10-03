import { useContext } from "react";
import { LanguageContext } from "../contexts/LanguageContextValue";
import type { LanguageContextValue } from "../contexts/LanguageContextValue";
import type { TranslationKey } from "../contexts/LanguageContext";

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage deve ser utilizado dentro de LanguageProvider.");
  return context;
}

export type { TranslationKey };
