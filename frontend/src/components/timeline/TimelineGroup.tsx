import {
  CalendarMonthOutlined,
} from "@mui/icons-material";

import {
  Box,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import TimelineItem from "./TimelineItem";

import type {
  TimelineGroup as TimelineGroupData,
} from "./TimelineTypes";

interface TimelineGroupProps {
  group: TimelineGroupData;
}

function TimelineGroup({
  group,
}: TimelineGroupProps) {
  const totalEvents =
    group.events.length;

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={1.5}
        alignItems={{
          xs: "flex-start",
          sm: "center",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexShrink={0}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "action.selected",
              color: "primary.main",
            }}
          >
            <CalendarMonthOutlined
              fontSize="small"
            />
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
            >
              {group.title}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              {totalEvents} evento
              {totalEvents === 1
                ? ""
                : "s"}{" "}
              registrado
              {totalEvents === 1
                ? ""
                : "s"}
            </Typography>
          </Box>
        </Stack>

        <Divider
          sx={{
            flex: 1,
            width: {
              xs: "100%",
              sm: "auto",
            },
          }}
        />

        <Chip
          label={`${totalEvents} evento${
            totalEvents === 1
              ? ""
              : "s"
          }`}
          size="small"
          variant="outlined"
          color="primary"
          sx={{
            fontWeight: 600,
          }}
        />
      </Stack>

      <Box
        sx={{
          pl: {
            xs: 0,
            sm: 0.5,
          },
        }}
      >
        {group.events.map(
          (
            event,
            index
          ) => (
            <TimelineItem
              key={event.id}
              event={event}
              isLast={
                index ===
                group.events.length -
                  1
              }
            />
          )
        )}
      </Box>
    </Stack>
  );
}

export default TimelineGroup;