import type {
  RouteObject,
} from "react-router-dom";

import ProtectedRoute from "../auth/ProtectedRoute";

import type {
  AppRoute,
} from "./types";

export function buildProtectedRoutes(
  routes: readonly AppRoute[]
): RouteObject[] {
  return routes.map((route) => {
    const {
      permission,
      anyOf,
      every,
      children,
      element,
      ...routeConfiguration
    } = route;

    const protectedElement = (
      <ProtectedRoute
        permission={permission}
        anyOf={anyOf}
        every={every}
      >
        {element}
      </ProtectedRoute>
    );

    return {
      ...routeConfiguration,
      element: protectedElement,
      children: children
        ? buildProtectedRoutes(children)
        : undefined,
    };
  });
}