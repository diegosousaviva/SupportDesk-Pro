import { createElement } from "react";
import { lazy } from "react";

import {
  Permissions,
} from "../auth/permissions";

import type {
  AppRoute,
} from "./types";

const InventoryListPage = lazy(
  () =>
    import(
      "../pages/Inventory/InventoryListPage"
    )
);

const CreateInventoryPage = lazy(
  () =>
    import(
      "../pages/Inventory/CreateInventoryPage"
    )
);

const InventoryDetailsPage = lazy(
  () =>
    import(
      "../pages/Inventory/InventoryDetailsPage"
    )
);

const EditInventoryPage = lazy(
  () =>
    import(
      "../pages/Inventory/EditInventoryPage"
    )
);

const InventoryLabelPage = lazy(
  () =>
    import(
      "../pages/Inventory/InventoryLabelPage"
    )
);

const InventoryBatchLabelPage = lazy(
  () =>
    import(
      "../pages/Inventory/InventoryBatchLabelPage"
    )
);

export const inventoryRoutes:
  readonly AppRoute[] = [
    {
      path: "/inventory",
      element: createElement(InventoryListPage),
      permission:
        Permissions.inventory.view,
    },

    {
      path: "/inventory/new",
      element: createElement(CreateInventoryPage),
      permission:
        Permissions.inventory.create,
    },

    /*
     * A rota fixa precisa ficar antes de /inventory/:id
     * para não interpretar "labels" como o ID do equipamento.
     */
    {
      path: "/inventory/labels",
      element: createElement(InventoryBatchLabelPage),
      permission:
        Permissions.inventory.view,
    },

    {
      path: "/inventory/:id",
      element: createElement(InventoryDetailsPage),
      permission:
        Permissions.inventory.view,
    },

    {
      path: "/inventory/:id/edit",
      element: createElement(EditInventoryPage),
      permission:
        Permissions.inventory.edit,
    },

    {
      path: "/inventory/:id/label",
      element: createElement(InventoryLabelPage),
      permission:
        Permissions.inventory.view,
    },
  ];