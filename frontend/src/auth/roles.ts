import {
  Permissions,
} from "./permissions";

import type {
  Permission,
} from "./permissions";

import type {
  UserRole,
} from "../types/User";

const ADMINISTRATOR_PERMISSIONS = [
  Permissions.dashboard.view,

  Permissions.users.view,
  Permissions.users.create,
  Permissions.users.edit,
  Permissions.users.delete,

  Permissions.tickets.view,
  Permissions.tickets.viewAll,
  Permissions.tickets.create,
  Permissions.tickets.edit,
  Permissions.tickets.delete,
  Permissions.tickets.assign,
  Permissions.tickets.updateStatus,
  Permissions.tickets.close,
  Permissions.tickets.comment,

  Permissions.categories.view,
  Permissions.categories.create,
  Permissions.categories.edit,
  Permissions.categories.delete,

  Permissions.stores.view,
  Permissions.stores.create,
  Permissions.stores.edit,
  Permissions.stores.delete,

  Permissions.reports.view,

  Permissions.settings.view,
  Permissions.settings.edit,

  Permissions.inventory.view,
  Permissions.inventory.create,
  Permissions.inventory.edit,
  Permissions.inventory.delete,

  Permissions.notes.view,
  Permissions.notes.viewAll,
  Permissions.notes.create,
  Permissions.notes.edit,
  Permissions.notes.delete,
] as const satisfies readonly Permission[];

const TECHNICIAN_PERMISSIONS = [
  Permissions.dashboard.view,

  Permissions.tickets.view,
  Permissions.tickets.viewAssigned,
  Permissions.tickets.updateStatus,
  Permissions.tickets.close,
  Permissions.tickets.comment,

  Permissions.stores.view,

  Permissions.inventory.view,
  Permissions.inventory.edit,

  Permissions.reports.view,

  Permissions.notes.view,
  Permissions.notes.viewOwn,
  Permissions.notes.create,
  Permissions.notes.editOwn,
  Permissions.notes.deleteOwn,
] as const satisfies readonly Permission[];

const REQUESTER_PERMISSIONS = [
  Permissions.dashboard.view,

  Permissions.tickets.view,
  Permissions.tickets.viewOwn,
  Permissions.tickets.create,
  Permissions.tickets.editOwn,
  Permissions.tickets.comment,

  Permissions.notes.view,
  Permissions.notes.viewOwn,
  Permissions.notes.create,
  Permissions.notes.editOwn,
  Permissions.notes.deleteOwn,
] as const satisfies readonly Permission[];

const ROLE_PERMISSIONS: Record<
  UserRole,
  readonly Permission[]
> = {
  Administrador:
    ADMINISTRATOR_PERMISSIONS,

  Técnico:
    TECHNICIAN_PERMISSIONS,

  Solicitante:
    REQUESTER_PERMISSIONS,
};

export function getRolePermissions(
  role: UserRole
): readonly Permission[] {
  return ROLE_PERMISSIONS[
    role
  ];
}

export function roleHasPermission(
  role: UserRole,
  permission: Permission
): boolean {
  return getRolePermissions(
    role
  ).includes(
    permission
  );
}

export function roleHasAnyPermission(
  role: UserRole,
  permissions: readonly Permission[]
): boolean {
  return permissions.some(
    (permission) =>
      roleHasPermission(
        role,
        permission
      )
  );
}

export function roleHasEveryPermission(
  role: UserRole,
  permissions: readonly Permission[]
): boolean {
  return permissions.every(
    (permission) =>
      roleHasPermission(
        role,
        permission
      )
  );
}