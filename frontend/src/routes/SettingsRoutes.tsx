import {
  lazy,
} from "react";

import {
  Permissions,
} from "../auth/permissions";

import type {
  AppRoute,
} from "./types";

const SettingsPage = lazy(
  () =>
    import(
      "../pages/Settings/SettingsPage"
    )
);

export const settingsRoutes: readonly AppRoute[] =
  [
    {
      path: "/settings",
      element: <SettingsPage />,
      permission:
        Permissions.settings.view,
    },
  ];