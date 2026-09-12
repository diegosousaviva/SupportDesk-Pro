import type {
  ReactNode,
} from "react";

import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { usePermissions } from "../hooks/usePermissions";

import type {
  Permission,
} from "./permissions";

interface ProtectedRouteProps {
  permission?: Permission;
  anyOf?: readonly Permission[];
  every?: readonly Permission[];
  children?: ReactNode;
}

function ProtectedRoute({
  permission,
  anyOf,
  every,
  children,
}: ProtectedRouteProps) {
  const location =
    useLocation();

  const {
    authenticated,
    user,
  } = useAuth();

  const {
    can,
    canAny,
    canEvery,
  } = usePermissions();

  // ==========================================================
  // USUÁRIO NÃO AUTENTICADO
  // ==========================================================

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  // ==========================================================
  // TROCA OBRIGATÓRIA DE SENHA
  // ==========================================================
  //
  // Usuários que ainda precisam trocar a senha não podem
  // acessar as demais áreas protegidas do sistema.
  //
  // A própria página de alteração de senha permanece liberada
  // para evitar um redirecionamento infinito.
  // ==========================================================

  const isPasswordChangePage =
    location.pathname ===
    "/alterar-senha";

  if (
    user?.mustChangePassword ===
      true &&
    !isPasswordChangePage
  ) {
    return (
      <Navigate
        to="/alterar-senha"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  // ==========================================================
  // PERMISSÕES
  // ==========================================================

  const hasPermission =
    !permission ||
    can(permission);

  const hasAnyPermission =
    !anyOf ||
    anyOf.length === 0 ||
    canAny(anyOf);

  const hasEveryPermission =
    !every ||
    every.length === 0 ||
    canEvery(every);

  const authorized =
    hasPermission &&
    hasAnyPermission &&
    hasEveryPermission;

  if (!authorized) {
    return (
      <Navigate
        to="/403"
        replace
      />
    );
  }

  // ==========================================================
  // RENDERIZAÇÃO
  // ==========================================================

  if (
    children !==
    undefined
  ) {
    return (
      <>
        {children}
      </>
    );
  }

  return (
    <Outlet />
  );
}

export default ProtectedRoute;