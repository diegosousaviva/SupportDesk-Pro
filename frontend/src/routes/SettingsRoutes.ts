import { createElement } from "react";
import { lazy } from "react";

import {
  Permissions,
} from "../auth/permissions";

import type {
  AppRoute,
} from "./types";

const SettingsPage =
  lazy(
    () =>
      import(
        "../pages/Settings/SettingsPage"
      )
  );

const AuditLogPage =
  lazy(
    () =>
      import(
        "../pages/Settings/AuditLogPage"
      )
  );

export const settingsRoutes:
  readonly AppRoute[] = [
    {
      path:
        "/settings",

      element:
        createElement(SettingsPage),

      permission:
        Permissions.settings.view,
    },

    {
      path:
        "/settings/audit",

      element:
        createElement(AuditLogPage),

      permission:
        Permissions.audit.view,
    },
  ];