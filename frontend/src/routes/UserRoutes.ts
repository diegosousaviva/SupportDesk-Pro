import { createElement } from "react";
import { lazy } from "react";

import { Permissions } from "../auth/permissions";

import type {
  AppRoute,
} from "./types";

const UserListPage = lazy(
  () => import("../pages/Users/UserListPage")
);

const CreateUserPage = lazy(
  () => import("../pages/Users/CreateUserPage")
);

const UserDetailsPage = lazy(
  () => import("../pages/Users/UserDetailsPage")
);

const EditUserPage = lazy(
  () => import("../pages/Users/EditUserPage")
);

export const userRoutes: AppRoute[] = [
  {
    path: "/users",
    permission:
      Permissions.users.view,
    element: createElement(UserListPage),
  },

  {
    path: "/users/new",
    permission:
      Permissions.users.create,
    element: createElement(CreateUserPage),
  },

  {
    path: "/users/:id",
    permission:
      Permissions.users.view,
    element: createElement(UserDetailsPage),
  },

  {
    path: "/users/:id/edit",
    permission:
      Permissions.users.edit,
    element: createElement(EditUserPage),
  },
];