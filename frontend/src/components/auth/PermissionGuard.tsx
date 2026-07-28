import type {
  ReactNode,
} from "react";

import { usePermissions } from "../../hooks/usePermissions";

import type {
  Permission,
} from "../../auth/permissions";

interface PermissionGuardProps {
  permission?: Permission;
  anyOf?: readonly Permission[];
  every?: readonly Permission[];
  fallback?: ReactNode;
  children: ReactNode;
}

function PermissionGuard({
  permission,
  anyOf,
  every,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const {
    can,
    canAny,
    canEvery,
  } = usePermissions();

  if (
    permission &&
    !can(permission)
  ) {
    return <>{fallback}</>;
  }

  if (
    anyOf &&
    anyOf.length > 0 &&
    !canAny(anyOf)
  ) {
    return <>{fallback}</>;
  }

  if (
    every &&
    every.length > 0 &&
    !canEvery(every)
  ) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default PermissionGuard;