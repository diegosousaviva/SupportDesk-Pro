import {
  lazy,
} from "react";

import {
  Permissions,
} from "../auth/permissions";

import type {
  AppRoute,
} from "./types";

const ReportsPage = lazy(
  () =>
    import(
      "../pages/Reports/ReportsPage"
    )
);

export const reportRoutes: readonly AppRoute[] =
  [
    {
      path: "/reports",
      element: <ReportsPage />,
      permission:
        Permissions.reports.view,
    },
  ];