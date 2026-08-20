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
  return routes.map(
    (
      route
    ): RouteObject => {
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
          permission={
            permission
          }
          anyOf={
            anyOf
          }
          every={
            every
          }
        >
          {element}
        </ProtectedRoute>
      );

      if (
        route.index
      ) {
        return {
          ...routeConfiguration,
          index: true,
          element:
            protectedElement,
        } as RouteObject;
      }

      return {
        ...routeConfiguration,
        element:
          protectedElement,

        ...(children
          ? {
              children:
                buildProtectedRoutes(
                  children
                ),
            }
          : {}),
      } as RouteObject;
    }
  );
}