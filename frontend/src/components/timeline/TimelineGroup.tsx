import {
  Box,
  Chip,
  Divider,
  Stack,
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
  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
      >
        <Divider
          sx={{
            flex: 1,
          }}
        />

        <Chip
          label={group.title}
          size="small"
          variant="outlined"
        />

        <Divider
          sx={{
            flex: 1,
          }}
        />
      </Stack>

      <Box>
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