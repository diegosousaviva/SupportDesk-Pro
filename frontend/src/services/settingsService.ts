export type PreferredTheme =
  | "light"
  | "dark"
  | "system";

export type SystemLanguage =
  | "pt-BR"
  | "en-US";

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

const STORAGE_KEY =
  "supportdesk-pro-settings";

export const defaultSettings: SettingsData = {
  companyName:
    "Suporte Droga Viva",

  supportEmail:
    "suporte@supportdesk.com",

  supportPhone:
    "(11) 99999-0000",

  website:
    "",

  notifyNewTicket:
    true,

  notifyStatusChange:
    true,

  notifyCriticalTicket:
    true,

  notifyAssignedTicket:
    true,

  notifySlaExpired:
    true,

  compactMode:
    false,

  preferredTheme:
    "light",

  language:
    "pt-BR",

  sessionTimeoutMinutes:
    60,

  maximumSessionDurationMinutes:
    480,

  requireStrongPassword:
    true,

  automaticLogout:
    false,
};

function isObject(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value
    )
  );
}

function normalizePreferredTheme(
  value: unknown
): PreferredTheme {
  if (
    value === "light" ||
    value === "dark" ||
    value === "system"
  ) {
    return value;
  }

  return defaultSettings.preferredTheme;
}

function normalizeLanguage(
  value: unknown
): SystemLanguage {
  if (
    value === "pt-BR" ||
    value === "en-US"
  ) {
    return value;
  }

  return defaultSettings.language;
}

function normalizePositiveNumber(
  value: unknown,
  fallback: number
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  ) {
    return value;
  }

  return fallback;
}

function normalizeSettings(
  value: unknown
): SettingsData {
  if (!isObject(value)) {
    return {
      ...defaultSettings,
    };
  }

  return {
    companyName:
      typeof value.companyName ===
        "string"
        ? value.companyName
        : defaultSettings.companyName,

    supportEmail:
      typeof value.supportEmail ===
        "string"
        ? value.supportEmail
        : defaultSettings.supportEmail,

    supportPhone:
      typeof value.supportPhone ===
        "string"
        ? value.supportPhone
        : defaultSettings.supportPhone,

    website:
      typeof value.website ===
        "string"
        ? value.website
        : defaultSettings.website,

    notifyNewTicket:
      typeof value.notifyNewTicket ===
        "boolean"
        ? value.notifyNewTicket
        : defaultSettings.notifyNewTicket,

    notifyStatusChange:
      typeof value.notifyStatusChange ===
        "boolean"
        ? value.notifyStatusChange
        : defaultSettings.notifyStatusChange,

    notifyCriticalTicket:
      typeof value.notifyCriticalTicket ===
        "boolean"
        ? value.notifyCriticalTicket
        : defaultSettings.notifyCriticalTicket,

    notifyAssignedTicket:
      typeof value.notifyAssignedTicket ===
        "boolean"
        ? value.notifyAssignedTicket
        : defaultSettings.notifyAssignedTicket,

    notifySlaExpired:
      typeof value.notifySlaExpired ===
        "boolean"
        ? value.notifySlaExpired
        : defaultSettings.notifySlaExpired,

    compactMode:
      typeof value.compactMode ===
        "boolean"
        ? value.compactMode
        : defaultSettings.compactMode,

    preferredTheme:
      normalizePreferredTheme(
        value.preferredTheme
      ),

    language:
      normalizeLanguage(
        value.language
      ),

    sessionTimeoutMinutes:
      normalizePositiveNumber(
        value.sessionTimeoutMinutes,
        defaultSettings.sessionTimeoutMinutes
      ),

    maximumSessionDurationMinutes:
      normalizePositiveNumber(
        value.maximumSessionDurationMinutes,
        defaultSettings.maximumSessionDurationMinutes
      ),

    requireStrongPassword:
      typeof value.requireStrongPassword ===
        "boolean"
        ? value.requireStrongPassword
        : defaultSettings.requireStrongPassword,

    automaticLogout:
      typeof value.automaticLogout ===
        "boolean"
        ? value.automaticLogout
        : defaultSettings.automaticLogout,
  };
}

export function getSettings():
  SettingsData {
  const storedSettings =
    localStorage.getItem(
      STORAGE_KEY
    );

  if (!storedSettings) {
    return {
      ...defaultSettings,
    };
  }

  try {
    const parsedSettings:
      unknown =
        JSON.parse(
          storedSettings
        );

    return normalizeSettings(
      parsedSettings
    );
  } catch (error) {
    console.error(
      "Não foi possível carregar as configurações.",
      error
    );

    return {
      ...defaultSettings,
    };
  }
}

export function saveSettings(
  settings: SettingsData
): SettingsData {
  const normalizedSettings =
    normalizeSettings(
      settings
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      normalizedSettings
    )
  );

  return normalizedSettings;
}

export function restoreDefaultSettings():
  SettingsData {
  const restoredSettings = {
    ...defaultSettings,
  };

  saveSettings(
    restoredSettings
  );

  return restoredSettings;
}

export function importSettings(
  value: unknown
): SettingsData {
  if (!isObject(value)) {
    throw new Error(
      "O arquivo não contém configurações válidas."
    );
  }

  const importedSettings =
    normalizeSettings(
      value
    );

  saveSettings(
    importedSettings
  );

  return importedSettings;
}

export function getSettingsStorageKey():
  string {
  return STORAGE_KEY;
}