import {
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import type {
  Ticket,
  TicketPriority,
  TicketStatus,
} from "../../types/Ticket";

interface DashboardRecentTicketsProps {
  tickets: Ticket[];
}

function getPriorityColor(
  priority: TicketPriority
):
  | "error"
  | "warning"
  | "info"
  | "success"
  | "default" {
  switch (priority) {
    case "Crítica":
      return "error";

    case "Alta":
      return "warning";

    case "Média":
      return "info";

    case "Baixa":
      return "success";

    default:
      return "default";
  }
}

function getStatusColor(
  status: TicketStatus
):
  | "warning"
  | "info"
  | "success"
  | "default" {
  switch (status) {
    case "Aberto":
      return "warning";

    case "Em andamento":
      return "info";

    case "Resolvido":
      return "success";

    default:
      return "default";
  }
}

export default function DashboardRecentTickets({
  tickets,
}: DashboardRecentTicketsProps) {
  return (
    <Paper
      sx={{
        p: 3,
        height: "100%",
      }}
    >
      <Stack
        spacing={0.5}
        sx={{ mb: 3 }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
        >
          Últimos chamados
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Os cinco chamados cadastrados mais recentemente.
        </Typography>
      </Stack>

      {tickets.length > 0 ? (
        <Stack spacing={1.5}>
          {tickets.map((ticket) => (
            <Box
              key={ticket.id}
              sx={{
                display: "flex",
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
                alignItems: {
                  xs: "flex-start",
                  sm: "center",
                },
                justifyContent: "space-between",
                gap: 2,
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                transition:
                  "border-color 200ms ease, transform 200ms ease",
                "&:hover": {
                  borderColor: "primary.main",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  color="primary.main"
                  fontWeight={700}
                >
                  #{ticket.id}
                </Typography>

                <Typography
                  fontWeight={600}
                  noWrap
                >
                  {ticket.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {ticket.category}
                </Typography>
              </Box>

              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
              >
                <Chip
                  label={ticket.priority}
                  color={getPriorityColor(
                    ticket.priority
                  )}
                  size="small"
                  variant="outlined"
                />

                <Chip
                  label={ticket.status}
                  color={getStatusColor(
                    ticket.status
                  )}
                  size="small"
                />
              </Stack>
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography color="text.secondary">
          Nenhum chamado foi cadastrado no período selecionado.
        </Typography>
      )}
    </Paper>
  );
}