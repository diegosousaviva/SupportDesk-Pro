import { listData, saveSharedSettings } from "./dataApi";

export type PreferredTheme = "light" | "dark" | "system";
export type SystemLanguage = "pt-BR" | "en-US";

export interface SettingsData {
  companyName: string;
  supportEmail: string;
  supportPhone: string;
  website: string;
  notifyNewTicket: boolean;
  notifyStatusChange: boolean;
  notifyCriticalTicket: boolean;
  notifyAssignedTicket: boolean;
  notifySlaExpired: boolean;
  compactMode: boolean;
  preferredTheme: PreferredTheme;
  language: SystemLanguage;
  sessionTimeoutMinutes: number;
  maximumSessionDurationMinutes: number;
  requireStrongPassword: boolean;
  automaticLogout: boolean;
}

type DevicePreferences = Pick<SettingsData, "compactMode" | "preferredTheme" | "language">;
type SharedSettings = Omit<SettingsData, keyof DevicePreferences>;
type StoredSettings = Partial<SettingsData> & { id?: number };

const LEGACY_STORAGE_KEY = "supportdesk-pro-settings";
const DEVICE_STORAGE_KEY = "supportdesk-pro-device-preferences";

export const defaultSettings: SettingsData = {
  companyName: "Suporte Droga Viva",
  supportEmail: "suporte@supportdesk.com",
  supportPhone: "(11) 99999-0000",
  website: "",
  notifyNewTicket: true,
  notifyStatusChange: true,
  notifyCriticalTicket: true,
  notifyAssignedTicket: true,
  notifySlaExpired: true,
  compactMode: false,
  preferredTheme: "light",
  language: "pt-BR",
  sessionTimeoutMinutes: 60,
  maximumSessionDurationMinutes: 480,
  requireStrongPassword: true,
  automaticLogout: false,
};

let sharedSettings: SharedSettings = toSharedSettings(defaultSettings);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeDevicePreferences(value: unknown): DevicePreferences {
  const input = isObject(value) ? value : {};
  return {
    compactMode: typeof input.compactMode === "boolean" ? input.compactMode : defaultSettings.compactMode,
    preferredTheme: input.preferredTheme === "light" || input.preferredTheme === "dark" || input.preferredTheme === "system"
      ? input.preferredTheme : defaultSettings.preferredTheme,
    language: input.language === "pt-BR" || input.language === "en-US" ? input.language : defaultSettings.language,
  };
}

function getDevicePreferences(): DevicePreferences {
  try {
    const current = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (current) return normalizeDevicePreferences(JSON.parse(current) as unknown);

    // Keep only per-device preferences from the old browser settings record.
    // Shared business/security settings are never loaded from this legacy value.
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) return normalizeDevicePreferences(JSON.parse(legacy) as unknown);
  } catch (error) {
    console.error("Não foi possível carregar as preferências deste computador.", error);
  }
  return normalizeDevicePreferences(undefined);
}

function toSharedSettings(value: SettingsData): SharedSettings {
  return {
    companyName: value.companyName,
    supportEmail: value.supportEmail,
    supportPhone: value.supportPhone,
    website: value.website,
    notifyNewTicket: value.notifyNewTicket,
    notifyStatusChange: value.notifyStatusChange,
    notifyCriticalTicket: value.notifyCriticalTicket,
    notifyAssignedTicket: value.notifyAssignedTicket,
    notifySlaExpired: value.notifySlaExpired,
    sessionTimeoutMinutes: value.sessionTimeoutMinutes,
    maximumSessionDurationMinutes: value.maximumSessionDurationMinutes,
    requireStrongPassword: value.requireStrongPassword,
    automaticLogout: value.automaticLogout,
  };
}

function normalizeSharedSettings(value: unknown): SharedSettings {
  const input = isObject(value) ? value : {};
  const stringValue = (key: keyof Pick<SettingsData, "companyName" | "supportEmail" | "supportPhone" | "website">) =>
    typeof input[key] === "string" ? input[key] as string : defaultSettings[key];
  const booleanValue = (key: keyof Pick<SettingsData, "notifyNewTicket" | "notifyStatusChange" | "notifyCriticalTicket" | "notifyAssignedTicket" | "notifySlaExpired" | "requireStrongPassword" | "automaticLogout">) =>
    typeof input[key] === "boolean" ? input[key] as boolean : defaultSettings[key];
  const positiveNumber = (key: "sessionTimeoutMinutes" | "maximumSessionDurationMinutes") => {
    const current = input[key];
    return typeof current === "number" && Number.isSafeInteger(current) && current > 0
      ? current : defaultSettings[key];
  };

  return {
    companyName: stringValue("companyName"),
    supportEmail: stringValue("supportEmail"),
    supportPhone: stringValue("supportPhone"),
    website: stringValue("website"),
    notifyNewTicket: booleanValue("notifyNewTicket"),
    notifyStatusChange: booleanValue("notifyStatusChange"),
    notifyCriticalTicket: booleanValue("notifyCriticalTicket"),
    notifyAssignedTicket: booleanValue("notifyAssignedTicket"),
    notifySlaExpired: booleanValue("notifySlaExpired"),
    sessionTimeoutMinutes: positiveNumber("sessionTimeoutMinutes"),
    maximumSessionDurationMinutes: positiveNumber("maximumSessionDurationMinutes"),
    requireStrongPassword: booleanValue("requireStrongPassword"),
    automaticLogout: booleanValue("automaticLogout"),
  };
}

export function getSettings(): SettingsData {
  return { ...sharedSettings, ...getDevicePreferences() };
}

export function saveDevicePreferences(preferences: Partial<DevicePreferences>): DevicePreferences {
  const normalized = normalizeDevicePreferences({ ...getDevicePreferences(), ...preferences });
  try {
    localStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify(normalized));
  } catch (error) {
    console.error("Não foi possível salvar as preferências deste computador.", error);
  }
  return normalized;
}

export async function refreshSettings(): Promise<SettingsData> {
  const records = await listData<StoredSettings>("settings");
  // The API serializes writes; selecting the newest record also handles pre-existing duplicates safely.
  const record = records[0];
  sharedSettings = normalizeSharedSettings(record ?? defaultSettings);
  return getSettings();
}

export async function saveSettings(settings: SettingsData): Promise<SettingsData> {
  const normalized = {
    ...normalizeSharedSettings(settings),
    ...normalizeDevicePreferences(settings),
  };
  const saved = await saveSharedSettings<StoredSettings>(toSharedSettings(normalized));
  sharedSettings = normalizeSharedSettings(saved);
  saveDevicePreferences(normalized);
  return getSettings();
}

export async function restoreDefaultSettings(): Promise<SettingsData> {
  return saveSettings({ ...defaultSettings });
}

export async function importSettings(value: unknown): Promise<SettingsData> {
  if (!isObject(value)) throw new Error("O arquivo não contém configurações válidas.");
  return saveSettings({ ...defaultSettings, ...value } as SettingsData);
}

export function getSettingsStorageKey(): string {
  return DEVICE_STORAGE_KEY;
}
