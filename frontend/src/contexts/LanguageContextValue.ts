import { createContext } from "react";
import type { SystemLanguage } from "../services/settingsService";
import type { TranslationKey } from "./LanguageContext";

export interface LanguageContextValue {
  language: SystemLanguage;
  setLanguage: (language: SystemLanguage) => void;
  t: (key: TranslationKey) => string;
}

export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);
