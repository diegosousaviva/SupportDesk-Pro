import {
  useMemo,
  useState,
} from "react";

import {
  HistoryOutlined,
} from "@mui/icons-material";

import {
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import TimelineFilter from "./TimelineFilter";
import TimelineGroup from "./TimelineGroup";

import type {
  TimelineEvent,
  TimelineFilterOption,
  TimelineGroup as TimelineGroupData,
} from "./TimelineTypes";

interface TimelineProps {
  events: TimelineEvent[];

  title?: string;

  subtitle?: string;

  filterOptions?:
    TimelineFilterOption[];
}

const ALL_FILTER_VALUE =
  "Todos";

function getDateKey(
  value: string
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "invalid";
  }

  return [
    date.getFullYear(),

    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    ),

    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    ),
  ].join("-");
}

function getGroupTitle(
  dateKey: string
): string {
  if (
    dateKey ===
    "invalid"
  ) {
    return "Data inválida";
  }

  const [
    year,
    month,
    day,
  ] = dateKey
    .split("-")
    .map(Number);

  const eventDate =
    new Date(
      year,
      month - 1,
      day
    );

  const today =
    new Date();

  const todayDate =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

  const eventOnlyDate =
    new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate()
    );

  const differenceInDays =
    Math.round(
      (
        todayDate.getTime() -
        eventOnlyDate.getTime()
      ) /
        86400000
    );

  if (
    differenceInDays ===
    0
  ) {
    return "Hoje";
  }

  if (
    differenceInDays ===
    1
  ) {
    return "Ontem";
  }

  return eventOnlyDate.toLocaleDateString(
    "pt-BR"
  );
}

function groupEventsByDate(
  events: TimelineEvent[]
): TimelineGroupData[] {
  const groupedEvents =
    new Map<
      string,
      TimelineEvent[]
    >();

  events.forEach(
    (event) => {
      const dateKey =
        getDateKey(
          event.performedAt
        );

      const currentEvents =
        groupedEvents.get(
          dateKey
        ) ?? [];

      currentEvents.push(
        event
      );

      groupedEvents.set(
        dateKey,
        currentEvents
      );
    }
  );

  return Array.from(
    groupedEvents.entries()
  )
    .sort(
      (
        firstGroup,
        secondGroup
      ) =>
        secondGroup[0].localeCompare(
          firstGroup[0]
        )
    )
    .map(
      (
        [
          dateKey,
          groupEvents,
        ]
      ) => ({
        title:
          getGroupTitle(
            dateKey
          ),

        events:
          [...groupEvents].sort(
            (
              firstEvent,
              secondEvent
            ) =>
              new Date(
                secondEvent.performedAt
              ).getTime() -
              new Date(
                firstEvent.performedAt
              ).getTime()
          ),
      })
    );
}

function Timeline({
  events,
  title =
    "Histórico",
  subtitle =
    "Acompanhe os eventos registrados.",
  filterOptions = [],
}: TimelineProps) {
  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState(
    ALL_FILTER_VALUE
  );

  const availableFilterOptions =
    useMemo<
      TimelineFilterOption[]
    >(
      () => [
        {
          value:
            ALL_FILTER_VALUE,

          label:
            "Todos",
        },

        ...filterOptions.filter(
          (option) =>
            option.value !==
            ALL_FILTER_VALUE
        ),
      ],
      [
        filterOptions,
      ]
    );

  const filteredEvents =
    useMemo(
      () =>
        selectedFilter ===
        ALL_FILTER_VALUE
          ? events
          : events.filter(
              (event) =>
                event.category ===
                selectedFilter
            ),
      [
        events,
        selectedFilter,
      ]
    );

  const groups =
    useMemo(
      () =>
        groupEventsByDate(
          filteredEvents
        ),
      [
        filteredEvents,
      ]
    );

  const totalDays =
    useMemo(
      () =>
        groupEventsByDate(
          events
        ).length,
      [
        events,
      ]
    );

  return (
    <Paper
      variant="outlined"
      sx={{
        p: {
          xs: 2.5,
          md: 3,
        },
      }}
    >
      <Stack spacing={3}>
        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            md: "center",
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
          >
            <Box
              sx={{
                width: 48,

                height: 48,

                borderRadius:
                  "50%",

                bgcolor:
                  "primary.main",

                color:
                  "primary.contrastText",

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                boxShadow:
                  2,

                flexShrink:
                  0,
              }}
            >
              <HistoryOutlined />
            </Box>

            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
              >
                {title}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {subtitle}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                sx={{
                  mt: 1,
                }}
              >
                <Chip
                  size="small"
                  color="primary"
                  label={`${events.length} evento${
                    events.length ===
                    1
                      ? ""
                      : "s"
                  }`}
                />

                <Chip
                  size="small"
                  variant="outlined"
                  label={`${totalDays} dia${
                    totalDays ===
                    1
                      ? ""
                      : "s"
                  }`}
                />

                {selectedFilter !==
                  ALL_FILTER_VALUE && (
                  <Chip
                    size="small"
                    color="info"
                    variant="outlined"
                    label={`${filteredEvents.length} resultado${
                      filteredEvents.length ===
                      1
                        ? ""
                        : "s"
                    }`}
                  />
                )}
              </Stack>
            </Box>
          </Stack>

          {availableFilterOptions.length >
            1 && (
            <TimelineFilter
              value={
                selectedFilter
              }
              options={
                availableFilterOptions
              }
              onChange={
                setSelectedFilter
              }
            />
          )}
        </Stack>

        <Divider />

        {groups.length ===
        0 ? (
          <Box
            sx={{
              py: 5,

              textAlign:
                "center",
            }}
          >
            <HistoryOutlined
              sx={{
                fontSize:
                  48,

                color:
                  "text.disabled",

                mb: 1,
              }}
            />

            <Typography
              fontWeight={700}
            >
              Nenhum evento encontrado
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              Não existem eventos para o filtro selecionado.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={4}>
            {groups.map(
              (
                group,
                index
              ) => (
                <TimelineGroup
                  key={`${group.title}-${index}`}
                  group={
                    group
                  }
                />
              )
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

export default Timeline;