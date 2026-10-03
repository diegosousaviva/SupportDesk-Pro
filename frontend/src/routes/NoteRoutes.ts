import { createElement } from "react";
import { lazy } from "react";

import {
  Permissions,
} from "../auth/permissions";

import type {
  AppRoute,
} from "./types";

const NoteListPage = lazy(
  () =>
    import(
      "../pages/Notes/NoteListPage"
    )
);

const CreateNotePage = lazy(
  () =>
    import(
      "../pages/Notes/CreateNotePage"
    )
);

const NoteDetailsPage = lazy(
  () =>
    import(
      "../pages/Notes/NoteDetailsPage"
    )
);

const EditNotePage = lazy(
  () =>
    import(
      "../pages/Notes/EditNotePage"
    )
);

export const noteRoutes:
  readonly AppRoute[] = [
    {
      path: "/notes",
      element: createElement(NoteListPage),
      permission:
        Permissions.notes.view,
    },

    {
      path: "/notes/new",
      element: createElement(CreateNotePage),
      permission:
        Permissions.notes.create,
    },

    {
      path: "/notes/:id",
      element: createElement(NoteDetailsPage),
      permission:
        Permissions.notes.view,
    },

    {
      path: "/notes/:id/edit",
      element: createElement(EditNotePage),
      anyOf: [
        Permissions.notes.edit,
        Permissions.notes.editOwn,
      ],
    },
  ];