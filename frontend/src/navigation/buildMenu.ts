import {
  roleHasPermission,
} from "../auth/roles";

import type {
  UserRole,
} from "../types/User";

import {
  navigationSections,
} from "./menu";

import type {
  NavigationSection,
} from "./types";

export function buildMenu(
  role: UserRole
): NavigationSection[] {
  return navigationSections.reduce<
    NavigationSection[]
  >((visibleSections, section) => {
    const visibleItems =
      section.items.filter((item) => {
        if (!item.permission) {
          return true;
        }

        return roleHasPermission(
          role,
          item.permission
        );
      });

    if (visibleItems.length === 0) {
      return visibleSections;
    }

    visibleSections.push({
      ...section,
      items: visibleItems,
    });

    return visibleSections;
  }, []);
}