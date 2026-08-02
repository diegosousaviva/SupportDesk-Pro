import {
  SaveOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Button,
  Grid,
  Stack,
} from "@mui/material";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  ChangeEvent,
} from "react";

import MainLayout from "../../components/layout/MainLayout";
import PageHeader from "../../components/common/PageHeader";

import AppearanceSettings from "../../components/settings/AppearanceSettings";
import CompanySettings from "../../components/settings/CompanySettings";
import NotificationSettings from "../../components/settings/NotificationSettings";
import SecuritySettings from "../../components/settings/SecuritySettings";
import SystemSettings from "../../components/settings/SystemSettings";

import type {
  AppearanceSettingsData,
} from "../../components/settings/AppearanceSettings";

import type {
  CompanySettingsData,
} from "../../components/settings/CompanySettings";

import type {
  NotificationSettingsData,
} from "../../components/settings/NotificationSettings";

import type {
  SecuritySettingsData,
} from "../../components/settings/SecuritySettings";

import {
  useColorMode,
} from "../../contexts/ColorModeContext";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

interface SettingsFormData
  extends CompanySettingsData,
    NotificationSettingsData,
    AppearanceSettingsData,
    SecuritySettingsData {}

const STORAGE_KEY =
  "supportdesk-pro-settings";

const defaultSettings: SettingsFormData = {
  companyName: "SupportDesk Pro",
  supportEmail:
    "suporte@supportdesk.com",
  supportPhone:
    "(11) 99999-0000",
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
  requireStrongPassword: true,
  automaticLogout: false,
};

function loadSettings(): SettingsFormData {
  const storedSettings =
    localStorage.getItem(
      STORAGE_KEY
    );

  if (!storedSettings) {
    return defaultSettings;
  }

  try {
    const parsedSettings =
      JSON.parse(
        storedSettings
      ) as Partial<SettingsFormData>;

    return {
      ...defaultSettings,
      ...parsedSettings,
    };
  } catch (error) {
    console.error(
      "Não foi possível carregar as configurações.",
      error
    );

    return defaultSettings;
  }
}

function SettingsPage() {
  const {
    showSnackbar,
  } = useSnackbar();

  const {
    preference,
    setColorMode,
  } = useColorMode();

  const importInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [
    settings,
    setSettings,
  ] = useState<SettingsFormData>(
    () => ({
      ...loadSettings(),
      preferredTheme:
        preference,
    })
  );

  const [
    saved,
    setSaved,
  ] = useState(false);

  useEffect(() => {
    setSettings(
      (currentSettings) => ({
        ...currentSettings,
        preferredTheme:
          preference,
      })
    );
  }, [preference]);

  function markAsChanged(): void {
    if (saved) {
      setSaved(false);
    }
  }

  function handleCompanyChange(
    field: keyof CompanySettingsData,
    value: string
  ): void {
    setSettings(
      (currentSettings) => ({
        ...currentSettings,
        [field]: value,
      })
    );

    markAsChanged();
  }

  function handleNotificationChange(
    field: keyof NotificationSettingsData,
    checked: boolean
  ): void {
    setSettings(
      (currentSettings) => ({
        ...currentSettings,
        [field]: checked,
      })
    );

    markAsChanged();
  }

  function handleAppearanceSwitchChange(
    field: "compactMode",
    checked: boolean
  ): void {
    setSettings(
      (currentSettings) => ({
        ...currentSettings,
        [field]: checked,
      })
    );

    markAsChanged();
  }

  function handleAppearanceSelectChange(
    field:
      | "preferredTheme"
      | "language",
    value: string
  ): void {
    if (
      field ===
      "preferredTheme"
    ) {
      const newPreference =
        value as AppearanceSettingsData["preferredTheme"];

      setColorMode(
        newPreference
      );

      setSettings(
        (currentSettings) => ({
          ...currentSettings,
          preferredTheme:
            newPreference,
        })
      );

      markAsChanged();

      return;
    }

    setSettings(
      (currentSettings) => ({
        ...currentSettings,
        language:
          value as AppearanceSettingsData["language"],
      })
    );

    markAsChanged();
  }

  function handleSecuritySwitchChange(
    field:
      | "requireStrongPassword"
      | "automaticLogout",
    checked: boolean
  ): void {
    setSettings(
      (currentSettings) => ({
        ...currentSettings,
        [field]: checked,
      })
    );

    markAsChanged();
  }

  function handleSessionTimeoutChange(
    value: number
  ): void {
    setSettings(
      (currentSettings) => ({
        ...currentSettings,
        sessionTimeoutMinutes:
          value,
      })
    );

    markAsChanged();
  }

  function handleSave(): void {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          settings
        )
      );

      setColorMode(
        settings.preferredTheme
      );

      setSaved(true);

      showSnackbar(
        "Configurações salvas com sucesso.",
        {
          severity: "success",
        }
      );
    } catch (error) {
      console.error(
        "Não foi possível salvar as configurações.",
        error
      );

      showSnackbar(
        "Não foi possível salvar as configurações.",
        {
          severity: "error",
        }
      );
    }
  }

  function handleExportBackup(): void {
    const backupData = {
      application:
        "SupportDesk Pro",
      version: "1.0.0",
      exportedAt:
        new Date().toISOString(),
      settings,
    };

    const fileContent =
      JSON.stringify(
        backupData,
        null,
        2
      );

    const blob =
      new Blob(
        [fileContent],
        {
          type: "application/json;charset=utf-8",
        }
      );

    const fileUrl =
      URL.createObjectURL(
        blob
      );

    const downloadLink =
      document.createElement(
        "a"
      );

    downloadLink.href =
      fileUrl;

    downloadLink.download =
      `supportdesk-configuracoes-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

    document.body.appendChild(
      downloadLink
    );

    downloadLink.click();

    document.body.removeChild(
      downloadLink
    );

    URL.revokeObjectURL(
      fileUrl
    );

    showSnackbar(
      "Backup das configurações exportado.",
      {
        severity: "success",
      }
    );
  }

  function handleImportBackup(): void {
    importInputRef.current?.click();
  }

  async function handleBackupFileChange(
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const fileContent =
        await file.text();

      const parsedBackup =
        JSON.parse(
          fileContent
        ) as {
          settings?: Partial<SettingsFormData>;
        };

      if (
        !parsedBackup.settings ||
        typeof parsedBackup.settings !==
          "object"
      ) {
        throw new Error(
          "O arquivo não contém configurações válidas."
        );
      }

      const restoredSettings: SettingsFormData =
        {
          ...defaultSettings,
          ...parsedBackup.settings,
        };

      setSettings(
        restoredSettings
      );

      setColorMode(
        restoredSettings.preferredTheme
      );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          restoredSettings
        )
      );

      setSaved(true);

      showSnackbar(
        "Configurações importadas com sucesso.",
        {
          severity: "success",
        }
      );
    } catch (error) {
      console.error(
        "Não foi possível importar o backup.",
        error
      );

      showSnackbar(
        "O arquivo de backup é inválido.",
        {
          severity: "error",
        }
      );
    }
  }

  function handleRestoreDefaults(): void {
    const confirmed =
      window.confirm(
        "Deseja restaurar todas as configurações para os valores padrão?"
      );

    if (!confirmed) {
      return;
    }

    setSettings(
      defaultSettings
    );

    setColorMode(
      defaultSettings.preferredTheme
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        defaultSettings
      )
    );

    setSaved(true);

    showSnackbar(
      "Configurações padrão restauradas.",
      {
        severity: "success",
      }
    );
  }

  function handleResetSystem(): void {
    const confirmed =
      window.confirm(
        "Esta ação apagará os dados locais do SupportDesk Pro, incluindo chamados, usuários, categorias e configurações. Deseja continuar?"
      );

    if (!confirmed) {
      return;
    }

    const keysToRemove: string[] =
      [];

    for (
      let index = 0;
      index <
      localStorage.length;
      index += 1
    ) {
      const key =
        localStorage.key(
          index
        );

      if (
        key?.startsWith(
          "supportdesk-pro-"
        )
      ) {
        keysToRemove.push(
          key
        );
      }
    }

    keysToRemove.forEach(
      (key) =>
        localStorage.removeItem(
          key
        )
    );

    sessionStorage.clear();

    window.location.href =
      "/login";
  }

  return (
    <MainLayout title="Configurações">
      <Stack spacing={3}>
        <PageHeader
          title="Configurações"
          subtitle="Gerencie as preferências institucionais, visuais e administrativas do sistema."
        />

        {saved && (
          <Alert severity="success">
            Configurações salvas com sucesso.
          </Alert>
        )}

        <Grid
          container
          spacing={3}
        >
          <Grid
            size={{
              xs: 12,
              lg: 6,
            }}
          >
            <CompanySettings
              settings={{
                companyName:
                  settings.companyName,
                supportEmail:
                  settings.supportEmail,
                supportPhone:
                  settings.supportPhone,
                website:
                  settings.website,
              }}
              onChange={
                handleCompanyChange
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              lg: 6,
            }}
          >
            <NotificationSettings
              settings={{
                notifyNewTicket:
                  settings.notifyNewTicket,

                notifyStatusChange:
                  settings.notifyStatusChange,

                notifyCriticalTicket:
                  settings.notifyCriticalTicket,

                notifyAssignedTicket:
                  settings.notifyAssignedTicket,

                notifySlaExpired:
                  settings.notifySlaExpired,
              }}
              onChange={
                handleNotificationChange
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              lg: 6,
            }}
          >
            <AppearanceSettings
              settings={{
                compactMode:
                  settings.compactMode,

                preferredTheme:
                  settings.preferredTheme,

                language:
                  settings.language,
              }}
              onSwitchChange={
                handleAppearanceSwitchChange
              }
              onSelectChange={
                handleAppearanceSelectChange
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              lg: 6,
            }}
          >
            <SecuritySettings
              settings={{
                sessionTimeoutMinutes:
                  settings.sessionTimeoutMinutes,

                requireStrongPassword:
                  settings.requireStrongPassword,

                automaticLogout:
                  settings.automaticLogout,
              }}
              onSwitchChange={
                handleSecuritySwitchChange
              }
              onSessionTimeoutChange={
                handleSessionTimeoutChange
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
            }}
          >
            <SystemSettings
              onExportBackup={
                handleExportBackup
              }
              onImportBackup={
                handleImportBackup
              }
              onRestoreDefaults={
                handleRestoreDefaults
              }
              onResetSystem={
                handleResetSystem
              }
            />
          </Grid>
        </Grid>

        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={
            handleBackupFileChange
          }
        />

        <Stack
          direction="row"
          justifyContent="flex-end"
        >
          <Button
            variant="contained"
            size="large"
            startIcon={
              <SaveOutlined />
            }
            onClick={
              handleSave
            }
          >
            Salvar configurações
          </Button>
        </Stack>
      </Stack>
    </MainLayout>
  );
}

export default SettingsPage;