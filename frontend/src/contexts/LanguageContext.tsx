import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  getSettings,
  saveSettings,
} from "../services/settingsService";

import type {
  SystemLanguage,
} from "../services/settingsService";

interface LanguageContextValue {
  language: SystemLanguage;

  setLanguage: (
    language: SystemLanguage
  ) => void;

  t: (
    key: TranslationKey
  ) => string;
}

interface LanguageProviderProps {
  children: ReactNode;
}

const LANGUAGE_CHANGED_EVENT =
  "supportdesk-language-changed";

const translations = {
  "pt-BR": {
    "common.save": "Salvar",
    "common.cancel": "Cancelar",
    "common.back": "Voltar",

    "settings.title": "Configurações",
    "settings.subtitle":
      "Gerencie as preferências institucionais, visuais e administrativas do sistema.",
    "settings.saved":
      "Configurações salvas com sucesso.",
    "settings.saveError":
      "Não foi possível salvar as configurações.",
    "settings.saveButton":
      "Salvar configurações",
    "settings.backupExported":
      "Backup das configurações exportado.",
    "settings.backupImported":
      "Configurações importadas com sucesso.",
    "settings.backupInvalid":
      "O arquivo de backup é inválido.",
    "settings.backupMissingSettings":
      "O arquivo não contém configurações válidas.",
    "settings.restoreConfirm":
      "Deseja restaurar todas as configurações para os valores padrão?",
    "settings.restoreSuccess":
      "Configurações padrão restauradas.",
    "settings.restoreError":
      "Não foi possível restaurar as configurações padrão.",
    "settings.resetConfirm":
      "Esta ação apagará os dados locais do Suporte Droga Viva, incluindo chamados, usuários, categorias e configurações. Deseja continuar?",

    "settings.audit.title": "Auditoria",
    "settings.audit.description":
      "Consulte o histórico de acessos, alterações e ações administrativas realizadas no sistema.",
    "settings.audit.button":
      "Ver auditoria",

    "company.title":
      "Dados da empresa",
    "company.description":
      "Informações institucionais utilizadas no sistema e nos relatórios.",
    "company.name":
      "Nome da empresa",
    "company.supportEmail":
      "E-mail de suporte",
    "company.supportPhone":
      "Telefone de suporte",
    "company.website":
      "Site da empresa",
    "company.websitePlaceholder":
      "https://www.exemplo.com.br",

    "notifications.title":
      "Notificações",
    "notifications.description":
      "Escolha quais eventos devem gerar alertas no sistema.",
    "notifications.newTicket":
      "Notificar novos chamados",
    "notifications.statusChange":
      "Notificar mudanças de status",
    "notifications.criticalTicket":
      "Notificar chamados críticos",
    "notifications.assignedTicket":
      "Notificar chamados atribuídos",
    "notifications.slaExpired":
      "Notificar chamados com SLA vencido",

    "appearance.title":
      "Aparência",
    "appearance.description":
      "Defina o tema, a densidade visual e o idioma da interface.",
    "appearance.theme":
      "Tema preferido",
    "appearance.theme.light":
      "Claro",
    "appearance.theme.dark":
      "Escuro",
    "appearance.theme.system":
      "Sistema",
    "appearance.language":
      "Idioma",
    "appearance.compact":
      "Usar modo compacto",

    "security.title":
      "Segurança",
    "security.description":
      "Defina regras de sessão e políticas básicas de segurança.",
    "security.inactivityTimeout":
      "Tempo de inatividade",
    "security.maximumSessionDuration":
      "Duração máxima da sessão",
    "security.oneMinute":
      "1 minuto",
    "security.fifteenMinutes":
      "15 minutos",
    "security.thirtyMinutes":
      "30 minutos",
    "security.oneHour":
      "1 hora",
    "security.twoHours":
      "2 horas",
    "security.fourHours":
      "4 horas",
    "security.eightHours":
      "8 horas",
    "security.twelveHours":
      "12 horas",
    "security.twentyFourHours":
      "24 horas",
    "security.strongPassword":
      "Exigir senha forte",
    "security.automaticLogout":
      "Encerrar a sessão automaticamente após o período de inatividade",
    "security.help":
      "O tempo de inatividade controla o logout automático sem interação. A duração máxima limita o tempo total da sessão, mesmo com o usuário ativo.",

    "system.title":
      "Sistema",
    "system.version":
      "Versão 1.0.0",
    "system.description":
      "Faça backup, restaure preferências ou redefina os dados locais do sistema.",
    "system.info":
      "Nesta versão, os dados são armazenados no navegador. O backup completo com banco de dados será implementado na fase de backend.",
    "system.export":
      "Exportar configurações",
    "system.import":
      "Importar configurações",
    "system.restore":
      "Restaurar padrões",
    "system.reset":
      "Resetar dados locais",

    "navigation.main":
      "Principal",
    "navigation.administration":
      "Administração",
    "navigation.dashboard":
      "Dashboard",
    "navigation.tickets":
      "Chamados",
    "navigation.inventory":
      "Inventário",
    "navigation.notes":
      "Notas",
    "navigation.users":
      "Usuários",
    "navigation.categories":
      "Categorias",
    "navigation.stores":
      "Lojas",
    "navigation.reports":
      "Relatórios",
    "navigation.settings":
      "Configurações",

    "sidebar.supportCenter":
      "Central de Suporte",
    "sidebar.comingSoon":
      "Em breve",
    "sidebar.openTickets":
      "em aberto",
    "sidebar.operationalSystem":
      "Sistema operacional",
    "sidebar.allServicesOnline":
      "Todos os serviços online",
    "sidebar.mainMenu":
      "Menu principal",

    "header.openMenu":
      "Abrir menu",
    "header.openSidebar":
      "Abrir menu lateral",
    "header.userOptions":
      "Opções do usuário",
    "header.openUserOptions":
      "Abrir opções do usuário",
    "header.myProfile":
      "Meu perfil",
    "header.logout":
      "Sair",
    "header.defaultUser":
      "Usuário",
  },

  "en-US": {
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.back": "Back",

    "settings.title": "Settings",
    "settings.subtitle":
      "Manage institutional, visual, and administrative system preferences.",
    "settings.saved":
      "Settings saved successfully.",
    "settings.saveError":
      "Unable to save settings.",
    "settings.saveButton":
      "Save settings",
    "settings.backupExported":
      "Settings backup exported.",
    "settings.backupImported":
      "Settings imported successfully.",
    "settings.backupInvalid":
      "The backup file is invalid.",
    "settings.backupMissingSettings":
      "The file does not contain valid settings.",
    "settings.restoreConfirm":
      "Do you want to restore all settings to their default values?",
    "settings.restoreSuccess":
      "Default settings restored.",
    "settings.restoreError":
      "Unable to restore default settings.",
    "settings.resetConfirm":
      "This action will delete the local Suporte Droga Viva data, including tickets, users, categories, and settings. Do you want to continue?",

    "settings.audit.title": "Audit",
    "settings.audit.description":
      "Review the history of access, changes, and administrative actions performed in the system.",
    "settings.audit.button":
      "View audit",

    "company.title":
      "Company information",
    "company.description":
      "Institutional information used throughout the system and in reports.",
    "company.name":
      "Company name",
    "company.supportEmail":
      "Support email",
    "company.supportPhone":
      "Support phone",
    "company.website":
      "Company website",
    "company.websitePlaceholder":
      "https://www.example.com",

    "notifications.title":
      "Notifications",
    "notifications.description":
      "Choose which events should generate system alerts.",
    "notifications.newTicket":
      "Notify about new tickets",
    "notifications.statusChange":
      "Notify about status changes",
    "notifications.criticalTicket":
      "Notify about critical tickets",
    "notifications.assignedTicket":
      "Notify about assigned tickets",
    "notifications.slaExpired":
      "Notify about tickets with expired SLA",

    "appearance.title":
      "Appearance",
    "appearance.description":
      "Set the theme, visual density, and interface language.",
    "appearance.theme":
      "Preferred theme",
    "appearance.theme.light":
      "Light",
    "appearance.theme.dark":
      "Dark",
    "appearance.theme.system":
      "System",
    "appearance.language":
      "Language",
    "appearance.compact":
      "Use compact mode",

    "security.title":
      "Security",
    "security.description":
      "Define session rules and basic security policies.",
    "security.inactivityTimeout":
      "Inactivity timeout",
    "security.maximumSessionDuration":
      "Maximum session duration",
    "security.oneMinute":
      "1 minute",
    "security.fifteenMinutes":
      "15 minutes",
    "security.thirtyMinutes":
      "30 minutes",
    "security.oneHour":
      "1 hour",
    "security.twoHours":
      "2 hours",
    "security.fourHours":
      "4 hours",
    "security.eightHours":
      "8 hours",
    "security.twelveHours":
      "12 hours",
    "security.twentyFourHours":
      "24 hours",
    "security.strongPassword":
      "Require strong password",
    "security.automaticLogout":
      "Automatically end the session after the inactivity period",
    "security.help":
      "The inactivity timeout controls automatic logout when there is no interaction. The maximum duration limits the total session time, even while the user is active.",

    "system.title":
      "System",
    "system.version":
      "Version 1.0.0",
    "system.description":
      "Back up, restore preferences, or reset the system's local data.",
    "system.info":
      "In this version, data is stored in the browser. Full database backup will be implemented during the backend phase.",
    "system.export":
      "Export settings",
    "system.import":
      "Import settings",
    "system.restore":
      "Restore defaults",
    "system.reset":
      "Reset local data",

    "navigation.main":
      "Main",
    "navigation.administration":
      "Administration",
    "navigation.dashboard":
      "Dashboard",
    "navigation.tickets":
      "Tickets",
    "navigation.inventory":
      "Inventory",
    "navigation.notes":
      "Notes",
    "navigation.users":
      "Users",
    "navigation.categories":
      "Categories",
    "navigation.stores":
      "Stores",
    "navigation.reports":
      "Reports",
    "navigation.settings":
      "Settings",

    "sidebar.supportCenter":
      "Support Center",
    "sidebar.comingSoon":
      "Coming soon",
    "sidebar.openTickets":
      "open",
    "sidebar.operationalSystem":
      "System status",
    "sidebar.allServicesOnline":
      "All services online",
    "sidebar.mainMenu":
      "Main menu",

    "header.openMenu":
      "Open menu",
    "header.openSidebar":
      "Open sidebar",
    "header.userOptions":
      "User options",
    "header.openUserOptions":
      "Open user options",
    "header.myProfile":
      "My profile",
    "header.logout":
      "Log out",
    "header.defaultUser":
      "User",
  },
} as const;

type TranslationLanguage =
  keyof typeof translations;

export type TranslationKey =
  keyof typeof translations["pt-BR"];

const LanguageContext =
  createContext<
    LanguageContextValue | undefined
  >(undefined);

export function LanguageProvider({
  children,
}: LanguageProviderProps) {
  const [
    language,
    setCurrentLanguage,
  ] =
    useState<SystemLanguage>(
      () =>
        getSettings()
          .language
    );

  useEffect(() => {
    function handleLanguageChanged():
      void {
      setCurrentLanguage(
        getSettings()
          .language
      );
    }

    window.addEventListener(
      LANGUAGE_CHANGED_EVENT,
      handleLanguageChanged
    );

    return () => {
      window.removeEventListener(
        LANGUAGE_CHANGED_EVENT,
        handleLanguageChanged
      );
    };
  }, []);

  const setLanguage =
    useCallback(
      (
        newLanguage:
          SystemLanguage
      ): void => {
        const currentSettings =
          getSettings();

        saveSettings({
          ...currentSettings,
          language:
            newLanguage,
        });

        setCurrentLanguage(
          newLanguage
        );

        window.dispatchEvent(
          new Event(
            LANGUAGE_CHANGED_EVENT
          )
        );
      },
      []
    );

  const t =
    useCallback(
      (
        key:
          TranslationKey
      ): string => {
        const currentLanguage =
          language as TranslationLanguage;

        return (
          translations[
            currentLanguage
          ]?.[key] ??
          translations[
            "pt-BR"
          ][key]
        );
      },
      [
        language,
      ]
    );

  const contextValue =
    useMemo<
      LanguageContextValue
    >(
      () => ({
        language,
        setLanguage,
        t,
      }),
      [
        language,
        setLanguage,
        t,
      ]
    );

  return (
    <LanguageContext.Provider
      value={
        contextValue
      }
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage():
  LanguageContextValue {
  const context =
    useContext(
      LanguageContext
    );

  if (!context) {
    throw new Error(
      "useLanguage deve ser utilizado dentro de LanguageProvider."
    );
  }

  return context;
}