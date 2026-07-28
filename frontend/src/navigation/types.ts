import type {
  SvgIconComponent,
} from "@mui/icons-material";

import type {
  Permission,
} from "../auth/permissions";

export type NavigationBadge =
  | "openTickets";

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: SvgIconComponent;
  permission?: Permission;
  disabled?: boolean;
  badge?: NavigationBadge;
}

export interface NavigationSection {
  id: string;
  title: string;
  items: readonly NavigationItem[];
}