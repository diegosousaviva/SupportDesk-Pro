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
  const location = useLocation();

  const {
    authenticated,
  } = useAuth();

  const {
    can,
    canAny,
    canEvery,
  } = usePermissions();

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

  if (children !== undefined) {
    return <>{children}</>;
  }

  return <Outlet />;
}

export default ProtectedRoute;