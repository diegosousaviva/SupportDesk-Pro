import {
  AssignmentOutlined,
  Inventory2Outlined,
  OpenInNewOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  useNavigate,
} from "react-router-dom";

import type {
  RecentActivityItem,
} from "../../services/recentActivityService";

interface DashboardRecentActivityProps {
  activities:
    RecentActivityItem[];
}

function formatActivityDate(
  createdAt: string
): string {
  const date =
    new Date(
      createdAt
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Data não disponível";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle:
        "short",

      timeStyle:
        "short",
    }
  ).format(
    date
  );
}

function DashboardRecentActivity({
  activities,
}: DashboardRecentActivityProps) {
  const navigate =
    useNavigate();

  return (
    <Paper
      variant="outlined"
      sx={{
        p: {
          xs: 2.5,
          md: 3,
        },

        borderRadius: 3,
      }}
    >
      <Stack spacing={2.5}>
        <Box>
          <Typography
            variant="h6"
            fontWeight={700}
          >
            Atividades recentes
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Últimas movimentações registradas nos chamados e no inventário.
          </Typography>
        </Box>

        {activities.length ===
        0 ? (
          <Alert severity="info">
            Nenhuma atividade recente foi encontrada.
          </Alert>
        ) : (
          <Stack
            divider={
              <Divider
                flexItem
              />
            }
          >
            {activities.map(
              (activity) => {
                const isTicket =
                  activity.source ===
                  "Chamado";

                return (
                  <Stack
                    key={
                      activity.id
                    }
                    direction={{
                      xs: "column",
                      md: "row",
                    }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{
                      xs: "stretch",
                      md: "center",
                    }}
                    sx={{
                      py: 2,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          flexShrink: 0,
                          borderRadius:
                            "50%",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          bgcolor:
                            isTicket
                              ? "primary.main"
                              : "secondary.main",
                          color:
                            "primary.contrastText",
                        }}
                      >
                        {isTicket ? (
                          <AssignmentOutlined />
                        ) : (
                          <Inventory2Outlined />
                        )}
                      </Box>

                      <Stack
                        spacing={0.75}
                        sx={{
                          minWidth: 0,
                        }}
                      >
                        <Stack
                          direction={{
                            xs: "column",
                            sm: "row",
                          }}
                          spacing={1}
                          alignItems={{
                            xs: "flex-start",
                            sm: "center",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontWeight={700}
                          >
                            {
                              activity.title
                            }
                          </Typography>

                          <Chip
                            size="small"
                            label={
                              activity.source
                            }
                            color={
                              isTicket
                                ? "primary"
                                : "secondary"
                            }
                            variant="outlined"
                          />
                        </Stack>

                        {activity.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {
                              activity.description
                            }
                          </Typography>
                        )}

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {
                            activity.performedBy
                          }
                          {" • "}
                          {
                            activity.performedByRole
                          }
                          {" • "}
                          {formatActivityDate(
                            activity.createdAt
                          )}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Button
                      size="small"
                      variant="text"
                      endIcon={
                        <OpenInNewOutlined />
                      }
                      onClick={() =>
                        navigate(
                          activity.path
                        )
                      }
                      sx={{
                        alignSelf: {
                          xs:
                            "flex-start",
                          md:
                            "center",
                        },

                        flexShrink:
                          0,
                      }}
                    >
                      Abrir
                    </Button>
                  </Stack>
                );
              }
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

export default DashboardRecentActivity;