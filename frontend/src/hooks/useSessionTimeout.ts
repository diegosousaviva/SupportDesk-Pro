import {
  useEffect,
  useRef,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../contexts/AuthContext";

import {
  useSnackbar,
} from "./useSnackbar";

const SETTINGS_STORAGE_KEY =
  "supportdesk-pro-settings";

const DEFAULT_SESSION_TIMEOUT_MINUTES =
  60;

const CHECK_INTERVAL_MILLISECONDS =
  15 * 1000;

interface SecuritySettings {
  automaticLogout:
    boolean;

  sessionTimeoutMinutes:
    number;
}

function loadSecuritySettings():
  SecuritySettings {
  try {
    const storedSettings =
      localStorage.getItem(
        SETTINGS_STORAGE_KEY
      );

    if (!storedSettings) {
      return {
        automaticLogout:
          false,

        sessionTimeoutMinutes:
          DEFAULT_SESSION_TIMEOUT_MINUTES,
      };
    }

    const parsedSettings =
      JSON.parse(
        storedSettings
      ) as {
        automaticLogout?:
          unknown;

        sessionTimeoutMinutes?:
          unknown;
      };

    const automaticLogout =
      parsedSettings.automaticLogout ===
      true;

    const storedTimeout =
      parsedSettings.sessionTimeoutMinutes;

    const sessionTimeoutMinutes =
      typeof storedTimeout ===
        "number" &&
      Number.isFinite(
        storedTimeout
      ) &&
      storedTimeout >
        0
        ? storedTimeout
        : DEFAULT_SESSION_TIMEOUT_MINUTES;

    return {
      automaticLogout,

      sessionTimeoutMinutes,
    };
  } catch (error) {
    console.error(
      "Não foi possível carregar as configurações de segurança da sessão.",
      error
    );

    return {
      automaticLogout:
        false,

      sessionTimeoutMinutes:
        DEFAULT_SESSION_TIMEOUT_MINUTES,
    };
  }
}

export function useSessionTimeout():
  void {
  const navigate =
    useNavigate();

  const {
    authenticated,
    logout,
  } = useAuth();

  const {
    showSnackbar,
  } = useSnackbar();

  const lastActivityRef =
    useRef(
      Date.now()
    );

  const sessionExpiredRef =
    useRef(
      false
    );

  useEffect(
    () => {
      if (
        !authenticated
      ) {
        lastActivityRef.current =
          Date.now();

        sessionExpiredRef.current =
          false;

        return;
      }

      lastActivityRef.current =
        Date.now();

      sessionExpiredRef.current =
        false;

      function registerActivity():
        void {
        lastActivityRef.current =
          Date.now();
      }

      function checkSession():
        void {
        if (
          sessionExpiredRef.current
        ) {
          return;
        }

        const settings =
          loadSecuritySettings();

        if (
          !settings.automaticLogout
        ) {
          lastActivityRef.current =
            Date.now();

          return;
        }

        const timeoutMilliseconds =
          settings.sessionTimeoutMinutes *
          60 *
          1000;

        const elapsedMilliseconds =
          Date.now() -
          lastActivityRef.current;

        if (
          elapsedMilliseconds <
          timeoutMilliseconds
        ) {
          return;
        }

        sessionExpiredRef.current =
          true;

        logout(
          "inactivity"
        );

        navigate(
          "/login",
          {
            replace:
              true,
          }
        );

        showSnackbar(
          "Sua sessão expirou por inatividade. Faça login novamente.",
          {
            severity:
              "warning",
          }
        );
      }

      const activityEvents = [
        "mousedown",
        "keydown",
        "scroll",
        "touchstart",
        "pointerdown",
      ] as const;

      activityEvents.forEach(
        (eventName) => {
          window.addEventListener(
            eventName,
            registerActivity,
            {
              passive:
                true,
            }
          );
        }
      );

      const intervalId =
        window.setInterval(
          checkSession,
          CHECK_INTERVAL_MILLISECONDS
        );

      return () => {
        activityEvents.forEach(
          (eventName) => {
            window.removeEventListener(
              eventName,
              registerActivity
            );
          }
        );

        window.clearInterval(
          intervalId
        );
      };
    },
    [
      authenticated,
      logout,
      navigate,
      showSnackbar,
    ]
  );
}