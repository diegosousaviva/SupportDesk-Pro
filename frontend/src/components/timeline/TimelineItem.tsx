import {
  AccessTimeOutlined,
} from "@mui/icons-material";

import {
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import TimelineAvatar from "./TimelineAvatar";

import type {
  TimelineEvent,
} from "./TimelineTypes";

interface TimelineItemProps {
  event: TimelineEvent;
  isLast?: boolean;
}

function formatRelativeDate(
  value: string
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Data inválida";
  }

  const today =
    new Date();

  const eventDate =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

  const currentDate =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

  const diffDays =
    Math.round(
      (
        currentDate.getTime() -
        eventDate.getTime()
      ) /
        86400000
    );

  const hour =
    date.toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  if (
    diffDays === 0
  ) {
    return `Hoje às ${hour}`;
  }

  if (
    diffDays === 1
  ) {
    return `Ontem às ${hour}`;
  }

  return `${date.toLocaleDateString(
    "pt-BR"
  )} às ${hour}`;
}

function TimelineItem({
  event,
  isLast = false,
}: TimelineItemProps) {
  const Icon =
    event.icon;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns:
          "56px 1fr",
        columnGap: 2,
      }}
    >
      <Stack
        alignItems="center"
        sx={{
          height: "100%",
        }}
      >
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            bgcolor:
              `${event.color}.main`,
            color:
              `${event.color}.contrastText`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: 3,
            transition:
              "all .2s ease",
            "&:hover": {
              transform:
                "scale(1.05)",
            },
          }}
        >
          <Icon />
        </Box>

        {!isLast && (
          <Box
            sx={{
              width: 2,
              flex: 1,
              bgcolor:
                "divider",
              mt: 1,
            }}
          />
        )}
      </Stack>

      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: 2,
          mb: isLast
            ? 0
            : 2,
          borderRadius: 2,
          transition:
            "all .2s ease",
          "&:hover": {
            boxShadow: 3,
          },
        }}
      >
        <Stack
          spacing={1.5}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={1}
          >
            <Typography
              variant="subtitle1"
              fontWeight={700}
            >
              {event.title}
            </Typography>

            <Chip
              size="small"
              color={
                event.color
              }
              label={
                event.category
              }
            />
          </Stack>

          {event.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.7,
                whiteSpace:
                  "pre-wrap",
              }}
            >
              {event.description}
            </Typography>
          )}

          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",
              md: "center",
            }}
            spacing={1.5}
          >
            <TimelineAvatar
              name={
                event.performedBy
              }
              role={
                event.performedByRole
              }
            />

            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
            >
              <AccessTimeOutlined
                sx={{
                  fontSize: 18,
                  color:
                    "text.secondary",
                }}
              />

              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                {formatRelativeDate(
                  event.performedAt
                )}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}

export default TimelineItem;