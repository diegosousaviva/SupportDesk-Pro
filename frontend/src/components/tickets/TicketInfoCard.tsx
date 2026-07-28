import {
  Box,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  CalendarMonth,
  PersonOutline,
  Schedule,
} from "@mui/icons-material";

interface TicketInfoCardProps {
  technicianName: string;
  technicianInactive?: boolean;
  createdAt: string;
  updatedAt: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Data não disponível";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function TicketInfoCard({
  technicianName,
  technicianInactive = false,
  createdAt,
  updatedAt,
}: TicketInfoCardProps) {
  return (
    <Paper
      sx={{
        p: {
          xs: 2.5,
          md: 4,
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: 700,
        }}
      >
        Informações do chamado
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
          },
          gap: 3,
        }}
      >
        <Stack direction="row" spacing={1.5}>
          <PersonOutline color="action" />

          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Técnico responsável
            </Typography>

            <Typography sx={{ fontWeight: 600 }}>
              {technicianName}
            </Typography>

            {technicianInactive && (
              <Typography
                variant="caption"
                color="warning.main"
              >
                Usuário inativo
              </Typography>
            )}
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <CalendarMonth color="action" />

          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Data de abertura
            </Typography>

            <Typography sx={{ fontWeight: 600 }}>
              {formatDate(createdAt)}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <Schedule color="action" />

          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Última atualização
            </Typography>

            <Typography sx={{ fontWeight: 600 }}>
              {formatDate(updatedAt)}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}