import {
  useEffect,
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

import {
  getAuthToken,
} from "../services/sessionService";

const VALIDATION_INTERVAL_MILLISECONDS =
  30 * 1000;

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

interface SessionValidationResponse {
  success: boolean;

  message?: string;

  user?: {
    id: number;

    name: string;

    email: string;

    phone: string;

    department: string;

    role:
      | "Administrador"
      | "Técnico"
      | "Solicitante";

    storeId?: number | null;

    status:
      | "Ativo"
      | "Inativo";

    createdAt: string;

    mustChangePassword?: boolean;
  };
}

export function useSessionValidation():
  void {
  const navigate =
    useNavigate();

  const {
    authenticated,
    refreshUser,
    logout,
  } = useAuth();

  const {
    showSnackbar,
  } = useSnackbar();

  useEffect(
    () => {
      if (!authenticated) {
        return;
      }

      let isMounted =
        true;

      async function validateSession():
        Promise<void> {
        const token =
          getAuthToken();

        if (!token) {
          if (!isMounted) {
            return;
          }

          logout(
            "user_deleted"
          );

          navigate(
            "/login",
            {
              replace:
                true,
            }
          );

          showSnackbar(
            "Sua sessão não está mais disponível. Faça login novamente.",
            {
              severity:
                "warning",
            }
          );

          return;
        }

        try {
          const response =
            await fetch(
              `${API_URL}/api/auth/me`,
              {
                method:
                  "GET",

                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const result =
            (await response.json()) as SessionValidationResponse;

          if (
            !response.ok ||
            !result.success ||
            !result.user
          ) {
            if (!isMounted) {
              return;
            }

            logout(
              "user_inactive"
            );

            navigate(
              "/login",
              {
                replace:
                  true,
              }
            );

            showSnackbar(
              result.message ||
                "Sua sessão não é mais válida. Faça login novamente.",
              {
                severity:
                  "warning",
              }
            );

            return;
          }

          /*
           * Atualiza os dados atuais do usuário
           * sem reiniciar o efeito de validação.
           *
           * O useEffect depende somente de
           * authenticated. Isso evita que o
           * refreshUser() provoque uma nova
           * validação imediatamente.
           */
          if (isMounted) {
            refreshUser(
              result.user
            );
          }
        } catch {
          /*
           * Uma falha momentânea de rede não
           * encerra a sessão.
           *
           * A próxima validação tentará novamente.
           */
        }
      }

      /*
       * Validação imediata ao iniciar.
       */
      void validateSession();

      /*
       * Depois, valida a sessão a cada 30 segundos.
       */
      const intervalId =
        window.setInterval(
          () => {
            void validateSession();
          },
          VALIDATION_INTERVAL_MILLISECONDS
        );

      return () => {
        isMounted =
          false;

        window.clearInterval(
          intervalId
        );
      };
    },
    [
      authenticated,
      refreshUser,
      logout,
      navigate,
      showSnackbar,
    ]
  );
}