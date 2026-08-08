import AssessmentIcon from "@mui/icons-material/Assessment";
import CategoryIcon from "@mui/icons-material/Category";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import NoteAltIcon from "@mui/icons-material/NoteAlt";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import StoreIcon from "@mui/icons-material/Store";

import {
  Permissions,
} from "../auth/permissions";

import type {
  NavigationSection,
} from "./types";

export const navigationSections:
  readonly NavigationSection[] = [
    {
      id: "main",
      title: "Principal",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          path: "/dashboard",
          icon: DashboardIcon,
          permission:
            Permissions.dashboard.view,
        },

        {
          id: "tickets",
          label: "Chamados",
          path: "/tickets",
          icon: ConfirmationNumberIcon,
          permission:
            Permissions.tickets.view,
          badge: "openTickets",
        },

        {
          id: "inventory",
          label: "Inventário",
          path: "/inventory",
          icon: Inventory2Icon,
          permission:
            Permissions.inventory.view,
        },

        {
          id: "notes",
          label: "Notas",
          path: "/notes",
          icon: NoteAltIcon,
          permission:
            Permissions.notes.view,
        },
      ],
    },

    {
      id: "administration",
      title: "Administração",
      items: [
        {
          id: "users",
          label: "Usuários",
          path: "/users",
          icon: PeopleIcon,
          permission:
            Permissions.users.view,
        },

        {
          id: "categories",
          label: "Categorias",
          path: "/categories",
          icon: CategoryIcon,
          permission:
            Permissions.categories.view,
        },

        {
          id: "stores",
          label: "Lojas",
          path: "/stores",
          icon: StoreIcon,
          permission:
            Permissions.stores.view,
        },

        {
          id: "reports",
          label: "Relatórios",
          path: "/reports",
          icon: AssessmentIcon,
          permission:
            Permissions.reports.view,
        },

        {
          id: "settings",
          label: "Configurações",
          path: "/settings",
          icon: SettingsIcon,
          permission:
            Permissions.settings.view,
        },
      ],
    },
  ];