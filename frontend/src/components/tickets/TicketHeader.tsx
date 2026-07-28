import {
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import type { Ticket } from "../../types/Ticket";

interface TicketHeaderProps {
  ticket: Ticket;
}

export default function TicketHeader({
  ticket,
}: TicketHeaderProps) {
  return (
    <Paper
      sx={{
        p: {
          xs: 2.5,
          md: 4,
        },
      }}
    >
      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "flex-start",
          md: "center",
        }}
        spacing={2}
      >
        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
          >
            Chamado #{ticket.id}
          </Typography>

          <Typography
            variant="h4"
            component="h1"
            sx={{
              mt: 0.5,
              fontWeight: 700,
            }}
          >
            {ticket.title}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Categoria: {ticket.category}
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
            color={
              ticket.priority === "Crítica" ||
              ticket.priority === "Alta"
                ? "error"
                : ticket.priority === "Média"
                  ? "warning"
                  : "success"
            }
          />

          <Chip
            label={ticket.status}
            color={
              ticket.status === "Aberto"
                ? "warning"
                : ticket.status === "Em andamento"
                  ? "info"
                  : "success"
            }
          />
        </Stack>
      </Stack>
    </Paper>
  );
}