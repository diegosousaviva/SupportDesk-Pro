import {
  AddCircleOutline,
  AssignmentOutlined,
  BuildOutlined,
  BusinessOutlined,
  EditOutlined,
  HistoryOutlined,
  LocalPrintshopOutlined,
  NoteAddOutlined,
  PersonOutline,
  SwapHorizOutlined,
  SyncAltOutlined,
} from "@mui/icons-material";

import {
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  getUserById,
} from "../../services/userService";

import type {
  InventoryHistoryEvent,
  InventoryHistoryEventType,
} from "../../types/InventoryHistory";

interface InventoryHistoryTimelineProps {
  events: InventoryHistoryEvent[];
}

type EventColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

function getEventColor(
  type: InventoryHistoryEventType
): EventColor {
  switch (type) {
    case "Cadastro":
      return "success";

    case "Edição":
      return "info";

    case "Mudança de situação":
      return "warning";

    case "Mudança de responsável":
      return "secondary";

    case "Mudança de loja":
      return "primary";

    case "Mudança de estado físico":
      return "warning";

    case "Impressão de etiqueta":
      return "info";

    case "Chamado vinculado":
      return "primary";

    case "Manutenção":
      return "error";

    case "Observação":
      return "default";

    default:
      return "default";
  }
}

function getEventIcon(
  type: InventoryHistoryEventType
) {
  switch (type) {
    case "Cadastro":
      return (
        <AddCircleOutline
          fontSize="small"
        />
      );

    case "Edição":
      return (
        <EditOutlined
          fontSize="small"
        />
      );

    case "Mudança de situação":
      return (
        <SyncAltOutlined
          fontSize="small"
        />
      );

    case "Mudança de responsável":
      return (
        <PersonOutline
          fontSize="small"
        />
      );

    case "Mudança de loja":
      return (
        <BusinessOutlined
          fontSize="small"
        />
      );

    case "Mudança de estado físico":
      return (
        <SwapHorizOutlined
          fontSize="small"
        />
      );

    case "Impressão de etiqueta":
      return (
        <LocalPrintshopOutlined
          fontSize="small"
        />
      );

    case "Chamado vinculado":
      return (
        <AssignmentOutlined
          fontSize="small"
        />
      );

    case "Manutenção":
      return (
        <BuildOutlined
          fontSize="small"
        />
      );

    case "Observação":
      return (
        <NoteAddOutlined
          fontSize="small"
        />
      );

    default:
      return (
        <HistoryOutlined
          fontSize="small"
        />
      );
  }
}

function formatDateTime(
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

  return date.toLocaleString(
    "pt-BR"
  );
}

function InventoryHistoryTimeline({
  events,
}: InventoryHistoryTimelineProps) {
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
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <HistoryOutlined
            color="primary"
          />

          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
            >
              Histórico do equipamento
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Acompanhe as alterações e eventos registrados neste ativo.
            </Typography>
          </Box>
        </Stack>

        <Divider />

        {events.length === 0 ? (
          <Box
            sx={{
              py: 5,
              textAlign: "center",
            }}
          >
            <HistoryOutlined
              sx={{
                fontSize: 48,
                color:
                  "text.disabled",
                mb: 1,
              }}
            />

            <Typography
              fontWeight={700}
            >
              Nenhum evento registrado
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              As próximas alterações feitas neste equipamento aparecerão aqui.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={0}>
            {events.map(
              (
                event,
                index
              ) => {
                const user =
                  event.performedByUserId ===
                  null
                    ? null
                    : getUserById(
                        event.performedByUserId
                      );

                const isLastEvent =
                  index ===
                  events.length - 1;

                return (
                  <Box
                    key={event.id}
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
                        height:
                          "100%",
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
                            `${getEventColor(
                              event.type
                            )}.main`,
                          color:
                            `${getEventColor(
                              event.type
                            )}.contrastText`,
                          flexShrink: 0,
                        }}
                      >
                        {getEventIcon(
                          event.type
                        )}
                      </Box>

                      {!isLastEvent && (
                        <Box
                          sx={{
                            width: 2,
                            flex: 1,
                            minHeight: 36,
                            bgcolor:
                              "divider",
                          }}
                        />
                      )}
                    </Stack>

                    <Box
                      sx={{
                        pb:
                          isLastEvent
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
                            event.type
                          }
                          color={
                            getEventColor(
                              event.type
                            )
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
                          xs: 0.25,
                          sm: 1,
                        }}
                        sx={{
                          mt: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.disabled"
                        >
                          {formatDateTime(
                            event.createdAt
                          )}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{
                            display: {
                              xs: "none",
                              sm: "block",
                            },
                          }}
                        >
                          •
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.disabled"
                        >
                          {user
                            ? `Realizado por ${user.name}`
                            : "Ação automática do sistema"}
                        </Typography>
                      </Stack>
                    </Box>
                  </Box>
                );
              }
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

export default InventoryHistoryTimeline;