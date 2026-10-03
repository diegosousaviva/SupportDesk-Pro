import { createElement } from "react";
import { lazy } from "react";

import {
  Permissions,
} from "../auth/permissions";

import type {
  AppRoute,
} from "./types";

const StoreListPage = lazy(
  () =>
    import(
      "../pages/Stores/StoreListPage"
    )
);

const CreateStorePage = lazy(
  () =>
    import(
      "../pages/Stores/CreateStorePage"
    )
);

const StoreDetailsPage = lazy(
  () =>
    import(
      "../pages/Stores/StoreDetailsPage"
    )
);

const EditStorePage = lazy(
  () =>
    import(
      "../pages/Stores/EditStorePage"
    )
);

export const storeRoutes:
  readonly AppRoute[] = [
    {
      path: "/stores",
      element: createElement(StoreListPage),
      permission:
        Permissions.stores.view,
    },

    {
      path: "/stores/new",
      element: createElement(CreateStorePage),
      permission:
        Permissions.stores.create,
    },

    {
      path: "/stores/:id",
      element: createElement(StoreDetailsPage),
      permission:
        Permissions.stores.view,
    },

    {
      path: "/stores/:id/edit",
      element: createElement(EditStorePage),
      permission:
        Permissions.stores.edit,
    },
  ];