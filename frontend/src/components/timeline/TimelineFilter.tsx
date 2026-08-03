import {
  Chip,
  Stack,
} from "@mui/material";

import type {
  TimelineFilterOption,
} from "./TimelineTypes";

interface TimelineFilterProps {
  value: string;

  options:
    TimelineFilterOption[];

  onChange: (
    value: string
  ) => void;
}

function TimelineFilter({
  value,
  options,
  onChange,
}: TimelineFilterProps) {
  return (
    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      flexWrap="wrap"
      alignItems="center"
    >
      {options.map(
        (option) => {
          const isSelected =
            value ===
            option.value;

          return (
            <Chip
              key={
                option.value
              }
              label={
                option.label
              }
              clickable
              color={
                isSelected
                  ? "primary"
                  : "default"
              }
              variant={
                isSelected
                  ? "filled"
                  : "outlined"
              }
              onClick={() =>
                onChange(
                  option.value
                )
              }
              sx={{
                fontWeight:
                  isSelected
                    ? 700
                    : 500,

                transition:
                  "all 0.2s ease",

                "&:hover": {
                  transform:
                    "translateY(-1px)",
                },
              }}
            />
          );
        }
      )}
    </Stack>
  );
}

export default TimelineFilter;