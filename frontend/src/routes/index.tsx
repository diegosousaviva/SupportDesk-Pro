import { lazy } from "react";

import {
  Navigate,
  useRoutes,
} from "react-router-dom";

import ProtectedRoute from "../auth/ProtectedRoute";
import PublicRoute from "../auth/PublicRoute";

import { buildProtectedRoutes } from "./buildProtectedRoutes";
import { dashboardRoutes } from "./DashboardRoutes";
import { publicRoutes } from "./PublicRoutes";
import { ticketRoutes } from "./TicketRoutes";
import { userRoutes } from "./UserRoutes";

const ForbiddenPage = lazy(
  () => import(
    "../pages/Forbidden/ForbiddenPage"
  )
);

function AppRoutes() {
  const protectedRoutes =
    buildProtectedRoutes([
      ...dashboardRoutes,
      ...ticketRoutes,
      ...userRoutes,
    ]);

  return useRoutes([
    {
      path: "/",
      element: (
        <Navigate
          to="/dashboard"
          replace
        />
      ),
    },

    {
      element: <PublicRoute />,
      children: publicRoutes,
    },

    {
      element: <ProtectedRoute />,
      children: [
        {
          path: "/403",
          element: <ForbiddenPage />,
        },

        ...protectedRoutes,
      ],
    },

    {
      path: "*",
      element: (
        <Navigate
          to="/dashboard"
          replace
        />
      ),
    },
  ]);
}

export default AppRoutes;