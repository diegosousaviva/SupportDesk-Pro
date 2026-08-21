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
  getSettings,
} from "../services/settingsService";

import {
  getSessionElapsedMilliseconds,
} from "../services/sessionService";

import {
  useSnackbar,
} from "./useSnackbar";

const CHECK_INTERVAL_MILLISECONDS =
  15 * 1000;

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

      function expireSession(
        reason:
          | "inactivity"
          | "maximum_duration",
        message: string
      ): void {
        if (
          sessionExpiredRef.current
        ) {
          return;
        }

        sessionExpiredRef.current =
          true;

        logout(
          reason
        );

        navigate(
          "/login",
          {
            replace:
              true,
          }
        );

        showSnackbar(
          message,
          {
            severity:
              "warning",
          }
        );
      }

      function checkMaximumSessionDuration(
        maximumSessionDurationMinutes:
          number
      ): boolean {
        const elapsedMilliseconds =
          getSessionElapsedMilliseconds();

        if (
          elapsedMilliseconds ===
          null
        ) {
          return false;
        }

        const maximumDurationMilliseconds =
          maximumSessionDurationMinutes *
          60 *
          1000;

        if (
          elapsedMilliseconds <
          maximumDurationMilliseconds
        ) {
          return false;
        }

        expireSession(
          "maximum_duration",
          "Sua sessão atingiu a duração máxima permitida. Faça login novamente."
        );

        return true;
      }

      function checkInactivity(
        sessionTimeoutMinutes:
          number
      ): boolean {
        const timeoutMilliseconds =
          sessionTimeoutMinutes *
          60 *
          1000;

        const elapsedMilliseconds =
          Date.now() -
          lastActivityRef.current;

        if (
          elapsedMilliseconds <
          timeoutMilliseconds
        ) {
          return false;
        }

        expireSession(
          "inactivity",
          "Sua sessão expirou por inatividade. Faça login novamente."
        );

        return true;
      }

      function checkSession():
        void {
        if (
          sessionExpiredRef.current
        ) {
          return;
        }

        const settings =
          getSettings();

        /*
         * A duração máxima da sessão é sempre aplicada,
         * independentemente de haver ou não atividade
         * do usuário.
         */
        const maximumDurationExpired =
          checkMaximumSessionDuration(
            settings.maximumSessionDurationMinutes
          );

        if (
          maximumDurationExpired
        ) {
          return;
        }

        /*
         * O controle por inatividade só é aplicado
         * quando o logout automático estiver ativado.
         */
        if (
          !settings.automaticLogout
        ) {
          return;
        }

        checkInactivity(
          settings.sessionTimeoutMinutes
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
        (
          eventName
        ) => {
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

      /*
       * Fazemos também uma verificação imediata.
       *
       * Isso é importante caso o usuário volte para uma
       * sessão antiga que já ultrapassou o tempo máximo.
       */
      checkSession();

      return () => {
        activityEvents.forEach(
          (
            eventName
          ) => {
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