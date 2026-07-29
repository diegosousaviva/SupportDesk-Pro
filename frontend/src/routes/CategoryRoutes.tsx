import { lazy } from "react";

import { Permissions } from "../auth/permissions";

import type { AppRoute } from "./types";

const CategoryListPage = lazy(
  () => import("../pages/Categories/CategoryListPage")
);

const CreateCategoryPage = lazy(
  () => import("../pages/Categories/CreateCategoryPage")
);

const CategoryDetailsPage = lazy(
  () => import("../pages/Categories/CategoryDetailsPage")
);

const EditCategoryPage = lazy(
  () => import("../pages/Categories/EditCategoryPage")
);

export const categoryRoutes: AppRoute[] = [
  {
    path: "/categories",
    permission: Permissions.categories.view,
    element: <CategoryListPage />,
  },

  {
    path: "/categories/new",
    permission: Permissions.categories.create,
    element: <CreateCategoryPage />,
  },

  {
    path: "/categories/:id",
    permission: Permissions.categories.view,
    element: <CategoryDetailsPage />,
  },

  {
    path: "/categories/:id/edit",
    permission: Permissions.categories.edit,
    element: <EditCategoryPage />,
  },
];