import {
  EmojiEventsOutlined,
  EngineeringOutlined,
} from "@mui/icons-material";

import {
  Avatar,
  Box,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import type {
  TechnicianRankingItem,
} from "../../services/dashboardService";

interface TechnicianRankingProps {
  ranking: TechnicianRankingItem[];
}

function getPositionLabel(
  position: number
): string {
  switch (position) {
    case 1:
      return "🥇";

    case 2:
      return "🥈";

    case 3:
      return "🥉";

    default:
      return `${position}º`;
  }
}

function getInitials(
  technicianName: string
): string {
  const normalizedName =
    technicianName
      .replace("— Inativo", "")
      .trim();

  if (!normalizedName) {
    return "?";
  }

  return normalizedName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (namePart) =>
        namePart
          .charAt(0)
          .toUpperCase()
    )
    .join("");
}

function TechnicianRanking({
  ranking,
}: TechnicianRankingProps) {
  const technicianRanking =
    ranking
      .filter(
        (item) =>
          item.technicianId !== null
      )
      .slice(0, 5);

  return (
    <Paper
      sx={{
        p: {
          xs: 2.5,
          md: 3,
        },
        height: "100%",
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ mb: 0.5 }}
      >
        <EmojiEventsOutlined
          color="warning"
        />

        <Typography
          variant="h6"
          fontWeight={700}
        >
          Ranking dos técnicos
        </Typography>
      </Stack>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Desempenho dos técnicos no período
        selecionado.
      </Typography>

      {technicianRanking.length === 0 ? (
        <Box
          sx={{
            minHeight: 240,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Stack
            spacing={1}
            alignItems="center"
          >
            <EngineeringOutlined
              sx={{
                fontSize: 42,
                color: "text.disabled",
              }}
            />

            <Typography
              color="text.secondary"
            >
              Nenhum técnico possui chamados no
              período selecionado.
            </Typography>
          </Stack>
        </Box>
      ) : (
        <Stack spacing={2}>
          {technicianRanking.map(
            (
              technician,
              index
            ) => {
              const position =
                index + 1;

              return (
                <Box
                  key={
                    technician.technicianId
                  }
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    transition:
                      "transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease",
                    "&:hover": {
                      transform:
                        "translateY(-2px)",
                      borderColor:
                        "primary.main",
                      boxShadow: 2,
                    },
                  }}
                >
                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    spacing={2}
                    alignItems={{
                      xs: "flex-start",
                      sm: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        width: 34,
                        flexShrink: 0,
                        fontSize:
                          position <= 3
                            ? "1.5rem"
                            : "1rem",
                        fontWeight: 800,
                        textAlign: "center",
                      }}
                    >
                      {getPositionLabel(
                        position
                      )}
                    </Typography>

                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor:
                          "primary.main",
                      }}
                    >
                      {getInitials(
                        technician.technicianName
                      )}
                    </Avatar>

                    <Box
                      sx={{
                        flexGrow: 1,
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        fontWeight={700}
                        noWrap
                      >
                        {
                          technician.technicianName
                        }
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {
                          technician.assignedTickets
                        }{" "}
                        chamado
                        {technician.assignedTickets ===
                        1
                          ? ""
                          : "s"}{" "}
                        atribuído
                        {technician.assignedTickets ===
                        1
                          ? ""
                          : "s"}
                      </Typography>

                      <LinearProgress
                        variant="determinate"
                        value={
                          technician.resolutionRate
                        }
                        sx={{
                          mt: 1.25,
                          height: 7,
                          borderRadius: 10,
                        }}
                      />
                    </Box>

                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      <Chip
                        label={`${
                          technician.resolvedTickets
                        } resolvido${
                          technician.resolvedTickets ===
                          1
                            ? ""
                            : "s"
                        }`}
                        color="success"
                        variant="outlined"
                        size="small"
                      />

                      <Chip
                        label={`${technician.resolutionRate}%`}
                        color={
                          technician.resolutionRate >=
                          80
                            ? "success"
                            : technician.resolutionRate >=
                                50
                              ? "warning"
                              : "error"
                        }
                        size="small"
                      />
                    </Stack>
                  </Stack>
                </Box>
              );
            }
          )}
        </Stack>
      )}
    </Paper>
  );
}

export default TechnicianRanking;