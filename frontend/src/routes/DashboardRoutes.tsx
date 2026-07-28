import { lazy } from "react";

import { Permissions } from "../auth/permissions";

import type {
  AppRoute,
} from "./types";

const DashboardPage = lazy(
  () => import("../pages/Dashboard/DashboardPage")
);

export const dashboardRoutes: AppRoute[] = [
  {
    path: "/dashboard",
    permission:
      Permissions.dashboard.view,
    element: <DashboardPage />,
  },
];