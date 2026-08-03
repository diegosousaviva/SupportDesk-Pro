import {
  Box,
  Chip,
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

function formatDate(
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

  return date.toLocaleDateString(
    "pt-BR"
  );
}

function formatTime(
  value: string
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "--:--";
  }

  return date.toLocaleTimeString(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function TimelineItem({
  event,
  isLast = false,
}: TimelineItemProps) {
  const EventIcon =
    event.icon;

  return (
    <Box
      sx={{
        display:
          "grid",

        gridTemplateColumns:
          "44px minmax(0, 1fr)",

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
            width: 38,
            height: 38,

            borderRadius:
              "50%",

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            bgcolor:
              `${event.color}.main`,

            color:
              `${event.color}.contrastText`,

            boxShadow:
              1,

            flexShrink:
              0,
          }}
        >
          <EventIcon
            fontSize="small"
          />
        </Box>

        {!isLast && (
          <Box
            sx={{
              width: 2,

              flex: 1,

              minHeight:
                36,

              bgcolor:
                "divider",
            }}
          />
        )}
      </Stack>

      <Box
        sx={{
          pb:
            isLast
              ? 0
              : 3,
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            sm: "center",
          }}
        >
          <Typography
            fontWeight={700}
          >
            {event.title}
          </Typography>

          <Chip
            label={
              event.category
            }
            color={
              event.color
            }
            size="small"
            variant="outlined"
          />
        </Stack>

        {event.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.75,

              whiteSpace:
                "pre-wrap",

              lineHeight:
                1.6,
            }}
          >
            {event.description}
          </Typography>
        )}

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={{
            xs: 1,
            sm: 2,
          }}
          alignItems={{
            xs: "flex-start",
            sm: "center",
          }}
          sx={{
            mt: 1.5,
          }}
        >
          <TimelineAvatar
            name={
              event.performedBy
            }
            role={
              event.performedByRole
            }
          />

          <Box
            sx={{
              display:
                "flex",

              alignItems:
                "center",

              gap: 0.75,

              px: 1.25,

              py: 0.5,

              borderRadius:
                999,

              bgcolor:
                "action.hover",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              {formatDate(
                event.performedAt
              )}
            </Typography>

            <Typography
              variant="caption"
              color="text.disabled"
            >
              •
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
            >
              {formatTime(
                event.performedAt
              )}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

export default TimelineItem;