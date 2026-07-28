import { useCallback } from "react";

import { useAuth } from "../contexts/AuthContext";

import {
  getRolePermissions,
  roleHasAnyPermission,
  roleHasEveryPermission,
  roleHasPermission,
} from "../auth/roles";

import type {
  Permission,
} from "../auth/permissions";

export interface UsePermissionsResult {
  permissions: readonly Permission[];

  can: (
    permission: Permission
  ) => boolean;

  canAny: (
    permissions: readonly Permission[]
  ) => boolean;

  canEvery: (
    permissions: readonly Permission[]
  ) => boolean;
}

export function usePermissions(): UsePermissionsResult {
  const { user } = useAuth();

  const permissions = user
    ? getRolePermissions(user.role)
    : [];

  const can = useCallback(
    (permission: Permission): boolean => {
      if (!user) {
        return false;
      }

      return roleHasPermission(
        user.role,
        permission
      );
    },
    [user]
  );

  const canAny = useCallback(
    (
      requiredPermissions: readonly Permission[]
    ): boolean => {
      if (!user) {
        return false;
      }

      return roleHasAnyPermission(
        user.role,
        requiredPermissions
      );
    },
    [user]
  );

  const canEvery = useCallback(
    (
      requiredPermissions: readonly Permission[]
    ): boolean => {
      if (!user) {
        return false;
      }

      return roleHasEveryPermission(
        user.role,
        requiredPermissions
      );
    },
    [user]
  );

  return {
    permissions,
    can,
    canAny,
    canEvery,
  };
}