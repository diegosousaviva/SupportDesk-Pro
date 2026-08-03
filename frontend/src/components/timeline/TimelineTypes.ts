import type {
  SvgIconComponent,
} from "@mui/icons-material";

import type {
  ChipProps,
} from "@mui/material";

export type TimelineColor =
  NonNullable<
    ChipProps["color"]
  >;

export interface TimelineEvent {
  id: number;

  title: string;

  description: string;

  category: string;

  performedBy: string;

  performedByRole?: string;

  performedAt: string;

  icon: SvgIconComponent;

  color: TimelineColor;
}

export interface TimelineGroup {
  title: string;

  events: TimelineEvent[];
}

export interface TimelineFilterOption {
  value: string;

  label: string;
}