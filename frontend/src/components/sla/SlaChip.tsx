import {
  AccessTimeOutlined,
  CheckCircleOutlined,
  ErrorOutline,
  WarningAmberOutlined,
} from "@mui/icons-material";

import {
  Chip,
  Tooltip,
} from "@mui/material";

import {
  calculateTicketSla,
  getSlaRemainingLabel,
  getSlaStatusLabel,
} from "../../services/slaService";

import type {
  SlaStatus,
} from "../../services/slaService";

import type {
  Ticket,
} from "../../types/Ticket";

interface SlaChipProps {
  ticket: Ticket;
  showRemainingTime?: boolean;
}

function getChipColor(
  status: SlaStatus
):
  | "success"
  | "warning"
  | "error"
  | "info" {
  switch (status) {
    case "within":
      return "info";

    case "warning":
      return "warning";

    case "expired":
      return "error";

    case "completed_within":
      return "success";

    case "completed_expired":
      return "error";
  }
}

function getStatusIcon(
  status: SlaStatus
) {
  switch (status) {
    case "within":
      return (
        <AccessTimeOutlined />
      );

    case "warning":
      return (
        <WarningAmberOutlined />
      );

    case "expired":
      return (
        <ErrorOutline />
      );

    case "completed_within":
      return (
        <CheckCircleOutlined />
      );

    case "completed_expired":
      return (
        <ErrorOutline />
      );
  }
}

function SlaChip({
  ticket,
  showRemainingTime = true,
}: SlaChipProps) {
  const sla =
    calculateTicketSla(
      ticket
    );

  const statusLabel =
    getSlaStatusLabel(
      sla.status
    );

  const remainingLabel =
    getSlaRemainingLabel(
      sla
    );

  const chipLabel =
    showRemainingTime
      ? `${statusLabel} — ${remainingLabel}`
      : statusLabel;

  return (
    <Tooltip
      title={`Prazo: ${new Date(
        sla.dueDate
      ).toLocaleString(
        "pt-BR"
      )}`}
      arrow
    >
      <Chip
        icon={
          getStatusIcon(
            sla.status
          )
        }
        label={
          chipLabel
        }
        color={
          getChipColor(
            sla.status
          )
        }
        size="small"
        variant={
          sla.status ===
            "within" ||
          sla.status ===
            "warning"
            ? "outlined"
            : "filled"
        }
        sx={{
          maxWidth: "100%",

          "& .MuiChip-label": {
            overflow: "hidden",
            textOverflow:
              "ellipsis",
          },
        }}
      />
    </Tooltip>
  );
}

export default SlaChip;