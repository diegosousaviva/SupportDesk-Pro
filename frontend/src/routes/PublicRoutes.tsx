import { lazy } from "react";

import type { RouteObject } from "react-router-dom";

const LoginPage = lazy(
  () => import("../pages/Login/LoginPage")
);

export const publicRoutes: RouteObject[] = [
  {
    path: "/login",
    element: <LoginPage />,
  },
];