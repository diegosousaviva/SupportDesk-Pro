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
  getSessionElapsedMilliseconds,
} from "../services/sessionService";

import {
  useSnackbar,
} from "./useSnackbar";

const SETTINGS_STORAGE_KEY =
  "supportdesk-pro-settings";

const DEFAULT_MAXIMUM_SESSION_DURATION_MINUTES =
  480;

const CHECK_INTERVAL_MILLISECONDS =
  15 * 1000;

function getMaximumSessionDurationMinutes():
  number {
  try {
    const storedSettings =
      localStorage.getItem(
        SETTINGS_STORAGE_KEY
      );

    if (!storedSettings) {
      return DEFAULT_MAXIMUM_SESSION_DURATION_MINUTES;
    }

    const parsedSettings =
      JSON.parse(
        storedSettings
      ) as {
        maximumSessionDurationMinutes?:
          unknown;
      };

    const configuredDuration =
      parsedSettings.maximumSessionDurationMinutes;

    if (
      typeof configuredDuration ===
        "number" &&
      Number.isFinite(
        configuredDuration
      ) &&
      configuredDuration >
        0
    ) {
      return configuredDuration;
    }

    return DEFAULT_MAXIMUM_SESSION_DURATION_MINUTES;
  } catch (error) {
    console.error(
      "Não foi possível carregar a duração máxima da sessão.",
      error
    );

    return DEFAULT_MAXIMUM_SESSION_DURATION_MINUTES;
  }
}

export function useMaximumSessionDuration():
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

  const expiredRef =
    useRef(
      false
    );

  useEffect(
    () => {
      if (
        !authenticated
      ) {
        expiredRef.current =
          false;

        return;
      }

      expiredRef.current =
        false;

      function validateMaximumDuration():
        void {
        if (
          expiredRef.current
        ) {
          return;
        }

        const elapsedMilliseconds =
          getSessionElapsedMilliseconds();

        if (
          elapsedMilliseconds ===
          null
        ) {
          return;
        }

        const maximumDurationMinutes =
          getMaximumSessionDurationMinutes();

        const maximumDurationMilliseconds =
          maximumDurationMinutes *
          60 *
          1000;

        if (
          elapsedMilliseconds <
          maximumDurationMilliseconds
        ) {
          return;
        }

        expiredRef.current =
          true;

        logout(
          "maximum_duration"
        );

        navigate(
          "/login",
          {
            replace:
              true,
          }
        );

        showSnackbar(
          "Sua sessão atingiu o tempo máximo permitido. Faça login novamente.",
          {
            severity:
              "warning",
          }
        );
      }

      validateMaximumDuration();

      const intervalId =
        window.setInterval(
          validateMaximumDuration,
          CHECK_INTERVAL_MILLISECONDS
        );

      return () => {
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