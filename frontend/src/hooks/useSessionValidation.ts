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
  getUserById,
} from "../services/userService";

import {
  useSnackbar,
} from "./useSnackbar";

const VALIDATION_INTERVAL_MILLISECONDS =
  30 * 1000;

function haveUserDataChanged(
  currentUser: {
    name: string;
    email: string;
    role: string;
    status: string;
  },
  registeredUser: {
    name: string;
    email: string;
    role: string;
    status: string;
  }
): boolean {
  return (
    currentUser.name !==
      registeredUser.name ||
    currentUser.email !==
      registeredUser.email ||
    currentUser.role !==
      registeredUser.role ||
    currentUser.status !==
      registeredUser.status
  );
}

export function useSessionValidation():
  void {
  const navigate =
    useNavigate();

  const {
    authenticated,
    user,
    logout,
    refreshUser,
  } = useAuth();

  const {
    showSnackbar,
  } = useSnackbar();

  useEffect(
    () => {
      if (
        !authenticated ||
        !user
      ) {
        return;
      }

      const activeUser =
        user;

      function validateSession():
        void {
        const registeredUser =
          getUserById(
            activeUser.id
          );

        if (
          !registeredUser
        ) {
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
            "Sua conta não está mais disponível. Faça login novamente.",
            {
              severity:
                "warning",
            }
          );

          return;
        }

        if (
          registeredUser.status !==
          "Ativo"
        ) {
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
            "Sua conta foi inativada. Entre em contato com o administrador.",
            {
              severity:
                "warning",
            }
          );

          return;
        }

        if (
          haveUserDataChanged(
            activeUser,
            registeredUser
          )
        ) {
          const {
            password:
              _password,

            ...refreshedUser
          } =
            registeredUser;

          refreshUser(
            refreshedUser
          );
        }
      }

      validateSession();

      const intervalId =
        window.setInterval(
          validateSession,
          VALIDATION_INTERVAL_MILLISECONDS
        );

      return () => {
        window.clearInterval(
          intervalId
        );
      };
    },
    [
      authenticated,
      user,
      logout,
      refreshUser,
      navigate,
      showSnackbar,
    ]
  );
}