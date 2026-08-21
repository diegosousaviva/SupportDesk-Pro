import {
  HistoryOutlined,
  SaveOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Button,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  ChangeEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Permissions,
} from "../../auth/permissions";

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

import {
  useColorMode,
} from "../../contexts/ColorModeContext";

import {
  useLanguage,
} from "../../contexts/LanguageContext";

import {
  usePermissions,
} from "../../hooks/usePermissions";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

import {
  getSettings,
  importSettings,
  restoreDefaultSettings,
  saveSettings,
} from "../../services/settingsService";

import type {
  SettingsData,
  SystemLanguage,
} from "../../services/settingsService";

type SettingsFormData =
  SettingsData;

function SettingsPage() {
  const navigate =
    useNavigate();

  const {
    can,
  } =
    usePermissions();

  const {
    showSnackbar,
  } =
    useSnackbar();

  const {
    preference,
    setColorMode,
  } =
    useColorMode();

  const {
    language,
    setLanguage,
    t,
  } =
    useLanguage();

  const importInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [
    settings,
    setSettings,
  ] =
    useState<SettingsFormData>(
      () => ({
        ...getSettings(),

        preferredTheme:
          preference,

        language,
      })
    );

  const [
    saved,
    setSaved,
  ] =
    useState(
      false
    );

  const canViewAudit =
    can(
      Permissions.audit.view
    );

  useEffect(() => {
    setSettings(
      (
        currentSettings
      ) => ({
        ...currentSettings,

        preferredTheme:
          preference,
      })
    );
  }, [
    preference,
  ]);

  useEffect(() => {
    setSettings(
      (
        currentSettings
      ) => ({
        ...currentSettings,

        language,
      })
    );
  }, [
    language,
  ]);

  function markAsChanged():
    void {
    if (
      saved
    ) {
      setSaved(
        false
      );
    }
  }

  function handleCompanyChange(
    field:
      keyof CompanySettingsData,
    value:
      string
  ): void {
    setSettings(
      (
        currentSettings
      ) => ({
        ...currentSettings,

        [field]:
          value,
      })
    );

    markAsChanged();
  }

  function handleNotificationChange(
    field:
      keyof NotificationSettingsData,
    checked:
      boolean
  ): void {
    setSettings(
      (
        currentSettings
      ) => ({
        ...currentSettings,

        [field]:
          checked,
      })
    );

    markAsChanged();
  }

  function handleAppearanceSwitchChange(
    field:
      "compactMode",
    checked:
      boolean
  ): void {
    setSettings(
      (
        currentSettings
      ) => ({
        ...currentSettings,

        [field]:
          checked,
      })
    );

    markAsChanged();
  }

  function handleAppearanceSelectChange(
    field:
      | "preferredTheme"
      | "language",
    value:
      string
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
        (
          currentSettings
        ) => ({
          ...currentSettings,

          preferredTheme:
            newPreference,
        })
      );

      markAsChanged();

      return;
    }

    const newLanguage =
      value as SystemLanguage;

    setLanguage(
      newLanguage
    );

    setSettings(
      (
        currentSettings
      ) => ({
        ...currentSettings,

        language:
          newLanguage,
      })
    );

    markAsChanged();
  }

  function handleSecuritySwitchChange(
    field:
      | "requireStrongPassword"
      | "automaticLogout",
    checked:
      boolean
  ): void {
    setSettings(
      (
        currentSettings
      ) => ({
        ...currentSettings,

        [field]:
          checked,
      })
    );

    markAsChanged();
  }

  function handleSessionTimeoutChange(
    value:
      number
  ): void {
    setSettings(
      (
        currentSettings
      ) => ({
        ...currentSettings,

        sessionTimeoutMinutes:
          value,
      })
    );

    markAsChanged();
  }

  function handleMaximumSessionDurationChange(
    value:
      number
  ): void {
    setSettings(
      (
        currentSettings
      ) => ({
        ...currentSettings,

        maximumSessionDurationMinutes:
          value,
      })
    );

    markAsChanged();
  }

  function handleSave():
    void {
    try {
      const savedSettings =
        saveSettings(
          settings
        );

      setSettings(
        savedSettings
      );

      setColorMode(
        savedSettings.preferredTheme
      );

      setLanguage(
        savedSettings.language
      );

      setSaved(
        true
      );

      showSnackbar(
        t(
          "settings.saved"
        ),
        {
          severity:
            "success",
        }
      );
    } catch (error) {
      console.error(
        "Não foi possível salvar as configurações.",
        error
      );

      showSnackbar(
        t(
          "settings.saveError"
        ),
        {
          severity:
            "error",
        }
      );
    }
  }

  function handleExportBackup():
    void {
    const backupData = {
      application:
        "Suporte Droga Viva",

      version:
        "1.0.0",

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
        [
          fileContent,
        ],
        {
          type:
            "application/json;charset=utf-8",
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
        .slice(
          0,
          10
        )}.json`;

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
      t(
        "settings.backupExported"
      ),
      {
        severity:
          "success",
      }
    );
  }

  function handleImportBackup():
    void {
    importInputRef.current?.click();
  }

  async function handleBackupFileChange(
    event:
      ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    const file =
      event.target.files?.[0];

    event.target.value =
      "";

    if (!file) {
      return;
    }

    try {
      const fileContent =
        await file.text();

      const parsedBackup:
        unknown =
          JSON.parse(
            fileContent
          );

      if (
        typeof parsedBackup !==
          "object" ||
        parsedBackup ===
          null ||
        !(
          "settings" in
          parsedBackup
        )
      ) {
        throw new Error(
          t(
            "settings.backupMissingSettings"
          )
        );
      }

      const restoredSettings =
        importSettings(
          (
            parsedBackup as {
              settings:
                unknown;
            }
          ).settings
        );

      setSettings(
        restoredSettings
      );

      setColorMode(
        restoredSettings.preferredTheme
      );

      setLanguage(
        restoredSettings.language
      );

      setSaved(
        true
      );

      showSnackbar(
        t(
          "settings.backupImported"
        ),
        {
          severity:
            "success",
        }
      );
    } catch (error) {
      console.error(
        "Não foi possível importar o backup.",
        error
      );

      showSnackbar(
        t(
          "settings.backupInvalid"
        ),
        {
          severity:
            "error",
        }
      );
    }
  }

  function handleRestoreDefaults():
    void {
    const confirmed =
      window.confirm(
        t(
          "settings.restoreConfirm"
        )
      );

    if (
      !confirmed
    ) {
      return;
    }

    try {
      const restoredSettings =
        restoreDefaultSettings();

      setSettings(
        restoredSettings
      );

      setColorMode(
        restoredSettings.preferredTheme
      );

      setLanguage(
        restoredSettings.language
      );

      setSaved(
        true
      );

      showSnackbar(
        t(
          "settings.restoreSuccess"
        ),
        {
          severity:
            "success",
        }
      );
    } catch (error) {
      console.error(
        "Não foi possível restaurar as configurações padrão.",
        error
      );

      showSnackbar(
        t(
          "settings.restoreError"
        ),
        {
          severity:
            "error",
        }
      );
    }
  }

  function handleResetSystem():
    void {
    const confirmed =
      window.confirm(
        t(
          "settings.resetConfirm"
        )
      );

    if (
      !confirmed
    ) {
      return;
    }

    const keysToRemove:
      string[] = [];

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

  function handleOpenAudit():
    void {
    navigate(
      "/settings/audit"
    );
  }

  return (
    <MainLayout
      title={t(
        "settings.title"
      )}
    >
      <Stack
        spacing={
          3
        }
      >
        <PageHeader
          title={t(
            "settings.title"
          )}
          subtitle={t(
            "settings.subtitle"
          )}
        />

        {saved && (
          <Alert
            severity="success"
          >
            {t(
              "settings.saved"
            )}
          </Alert>
        )}

        <Grid
          container
          spacing={
            3
          }
        >
          <Grid
            size={{
              xs:
                12,

              lg:
                6,
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
              xs:
                12,

              lg:
                6,
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
              xs:
                12,

              lg:
                6,
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
              xs:
                12,

              lg:
                6,
            }}
          >
            <SecuritySettings
              settings={{
                sessionTimeoutMinutes:
                  settings.sessionTimeoutMinutes,

                maximumSessionDurationMinutes:
                  settings.maximumSessionDurationMinutes,

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
              onMaximumSessionDurationChange={
                handleMaximumSessionDurationChange
              }
            />
          </Grid>

          {canViewAudit && (
            <Grid
              size={{
                xs:
                  12,
              }}
            >
              <Paper
                variant="outlined"
                sx={{
                  p: {
                    xs:
                      2.5,

                    md:
                      3,
                  },
                }}
              >
                <Stack
                  direction={{
                    xs:
                      "column",

                    sm:
                      "row",
                  }}
                  spacing={
                    2
                  }
                  justifyContent="space-between"
                  alignItems={{
                    xs:
                      "flex-start",

                    sm:
                      "center",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={
                      2
                    }
                    alignItems="center"
                  >
                    <HistoryOutlined
                      color="primary"
                      sx={{
                        fontSize:
                          38,
                      }}
                    />

                    <Stack
                      spacing={
                        0.5
                      }
                    >
                      <Typography
                        variant="h6"
                        fontWeight={
                          700
                        }
                      >
                        {t(
                          "settings.audit.title"
                        )}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {t(
                          "settings.audit.description"
                        )}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Button
                    variant="outlined"
                    startIcon={
                      <HistoryOutlined />
                    }
                    onClick={
                      handleOpenAudit
                    }
                    sx={{
                      flexShrink:
                        0,
                    }}
                  >
                    {t(
                      "settings.audit.button"
                    )}
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          )}

          <Grid
            size={{
              xs:
                12,
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
          ref={
            importInputRef
          }
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
            {t(
              "settings.saveButton"
            )}
          </Button>
        </Stack>
      </Stack>
    </MainLayout>
  );
}

export default SettingsPage;