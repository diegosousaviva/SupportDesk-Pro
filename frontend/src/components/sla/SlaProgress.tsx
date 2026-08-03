import {
  Box,
  LinearProgress,
  Stack,
  Typography,
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

interface SlaProgressProps {
  ticket: Ticket;
}

function getProgressColor(
  status: SlaStatus
):
  | "primary"
  | "success"
  | "warning"
  | "error" {
  switch (status) {
    case "within":
      return "success";

    case "warning":
      return "warning";

    case "expired":
      return "error";

    case "completed_within":
      return "primary";

    case "completed_expired":
      return "error";
  }
}

function formatProgressPercentage(
  percentage: number
): string {
  if (
    percentage > 0 &&
    percentage < 1
  ) {
    return percentage.toFixed(1);
  }

  return String(
    Math.round(
      percentage
    )
  );
}

function SlaProgress({
  ticket,
}: SlaProgressProps) {
  const sla =
    calculateTicketSla(
      ticket
    );

  const visualProgress =
    sla.expired
      ? 100
      : sla.progressPercentage > 0
        ? Math.max(
            1,
            sla.progressPercentage
          )
        : 0;

  const statusLabel =
    getSlaStatusLabel(
      sla.status
    );

  const remainingLabel =
    getSlaRemainingLabel(
      sla
    );

  const progressLabel =
    formatProgressPercentage(
      sla.progressPercentage
    );

  return (
    <Stack spacing={1.25}>
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        justifyContent="space-between"
        spacing={0.5}
      >
        <Typography
          variant="body2"
          fontWeight={700}
        >
          {statusLabel}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {progressLabel}% do prazo consumido
        </Typography>
      </Stack>

      <Box>
        <LinearProgress
          variant="determinate"
          value={visualProgress}
          color={
            getProgressColor(
              sla.status
            )
          }
          sx={{
            height: 10,
            borderRadius: 999,

            "& .MuiLinearProgress-bar":
              {
                borderRadius: 999,
              },
          }}
        />
      </Box>

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        justifyContent="space-between"
        spacing={0.5}
      >
        <Typography
          variant="caption"
          color={
            sla.expired
              ? "error.main"
              : sla.warning
                ? "warning.main"
                : "text.secondary"
          }
          fontWeight={
            sla.expired ||
            sla.warning
              ? 700
              : 400
          }
        >
          {remainingLabel}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
        >
          Prazo:{" "}
          {new Date(
            sla.dueDate
          ).toLocaleString(
            "pt-BR"
          )}
        </Typography>
      </Stack>
    </Stack>
  );
}

export default SlaProgress;