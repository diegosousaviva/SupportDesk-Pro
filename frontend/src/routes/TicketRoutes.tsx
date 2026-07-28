import { lazy } from "react";

import { Permissions } from "../auth/permissions";

import type {
  AppRoute,
} from "./types";

const TicketListPage = lazy(
  () => import("../pages/Tickets/TicketListPage")
);

const CreateTicketPage = lazy(
  () => import("../pages/Tickets/CreateTicketPage")
);

const TicketDetailsPage = lazy(
  () => import("../pages/Tickets/TicketDetailsPage")
);

const EditTicketPage = lazy(
  () => import("../pages/Tickets/EditTicketPage")
);

export const ticketRoutes: AppRoute[] = [
  {
    path: "/tickets",
    permission:
      Permissions.tickets.view,
    element: <TicketListPage />,
  },

  {
    path: "/tickets/new",
    permission:
      Permissions.tickets.create,
    element: <CreateTicketPage />,
  },

  {
    path: "/tickets/:id",
    permission:
      Permissions.tickets.view,
    element: <TicketDetailsPage />,
  },

  {
    path: "/tickets/:id/edit",
    anyOf: [
      Permissions.tickets.edit,
      Permissions.tickets.editOwn,
    ],
    element: <EditTicketPage />,
  },
];