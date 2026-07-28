import type {
  RouteObject,
} from "react-router-dom";

import type {
  Permission,
} from "../auth/permissions";

export type AppRoute = RouteObject & {
  permission?: Permission;
  anyOf?: readonly Permission[];
  every?: readonly Permission[];
  children?: AppRoute[];
};