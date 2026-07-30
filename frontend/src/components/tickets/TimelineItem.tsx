import {
  Avatar,
  Box,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import type {
  ReactNode,
} from "react";

interface TimelineItemProps {
  title: string;
  description: ReactNode;
  createdAt: string;
  icon: ReactNode;
  authorName?: string;
  updatedAt?: string;
  isLast?: boolean;
  action?: ReactNode;
}

function formatTimelineDate(
  dateString: string
): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Data não disponível";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "medium",
      timeStyle: "medium",
    }
  ).format(date);
}

function getAuthorInitial(
  authorName: string
): string {
  const normalizedName =
    authorName.trim();

  if (!normalizedName) {
    return "?";
  }

  return normalizedName
    .charAt(0)
    .toUpperCase();
}

export default function TimelineItem({
  title,
  description,
  createdAt,
  icon,
  authorName,
  updatedAt,
  isLast = false,
  action,
}: TimelineItemProps) {
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="stretch"
    >
      <Stack alignItems="center">
        {authorName ? (
          <Avatar
            sx={{
              width: 40,
              height: 40,
              fontSize: "1rem",
            }}
          >
            {getAuthorInitial(
              authorName
            )}
          </Avatar>
        ) : (
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor:
                "action.selected",
              color: "text.primary",
            }}
          >
            {icon}
          </Avatar>
        )}

        {!isLast && (
          <Box
            aria-hidden="true"
            sx={{
              width: 2,
              flex: 1,
              minHeight: 32,
              mt: 1,
              bgcolor: "divider",
            }}
          />
        )}
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          minWidth: 0,
          mb: isLast ? 0 : 2,
          p: {
            xs: 2,
            md: 2.5,
          },
        }}
      >
        <Stack spacing={1.5}>
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",
              sm: "flex-start",
            }}
            spacing={1}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  overflowWrap:
                    "anywhere",
                }}
              >
                {title}
              </Typography>

              {authorName && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {authorName}
                </Typography>
              )}
            </Box>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              alignItems={{
                xs: "flex-start",
                sm: "center",
              }}
              spacing={1}
            >
              <Stack
                spacing={0.25}
                alignItems={{
                  xs: "flex-start",
                  sm: "flex-end",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    whiteSpace:
                      "nowrap",
                  }}
                >
                  Criado em:{" "}
                  {formatTimelineDate(
                    createdAt
                  )}
                </Typography>

                {updatedAt && (
                  <Typography
                    variant="caption"
                    color="primary.main"
                    fontWeight={600}
                    sx={{
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    Editado em:{" "}
                    {formatTimelineDate(
                      updatedAt
                    )}
                  </Typography>
                )}
              </Stack>

              {action}
            </Stack>
          </Stack>

          {typeof description ===
          "string" ? (
            <Typography
              color="text.secondary"
              sx={{
                whiteSpace:
                  "pre-line",
                overflowWrap:
                  "anywhere",
                lineHeight: 1.7,
              }}
            >
              {description}
            </Typography>
          ) : (
            <Box>{description}</Box>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}