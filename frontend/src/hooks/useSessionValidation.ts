import {
  useEffect,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../hooks/useAuth";

import {
  useSnackbar,
} from "./useSnackbar";

import {
  getAuthToken,
} from "../services/sessionService";
import { API_BASE_URL as API_URL } from "../services/apiBaseUrl";

const VALIDATION_INTERVAL_MILLISECONDS =
  30 * 1000;

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

          // Limites de requisição e falhas do servidor são temporários; não
          // significam que o token atual deixou de ser válido.
          if (
            response.status === 429 ||
            response.status >= 500
          ) {
            return;
          }

          if (
            !response.ok ||
            !result.success ||
            !result.user
          ) {
            // Só respostas explícitas de autenticação/autorização inválida
            // encerram a sessão; outros erros podem ser temporários.
            if (
              response.status !== 401 &&
              response.status !== 403
            ) {
              return;
            }

            if (
              !isMounted
            ) {
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
           * Atualiza os dados atuais do usuário sem reiniciar o efeito.
           * O useEffect depende somente de authenticated, para evitar
           * uma validação imediata após refreshUser().
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
