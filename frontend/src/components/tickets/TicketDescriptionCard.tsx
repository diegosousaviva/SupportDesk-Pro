import {
  Divider,
  Paper,
  Typography,
} from "@mui/material";

interface TicketDescriptionCardProps {
  description: string;
}

export default function TicketDescriptionCard({
  description,
}: TicketDescriptionCardProps) {
  const normalizedDescription = description.trim();

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
        sx={{ fontWeight: 700 }}
      >
        Descrição do problema
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography
        color={
          normalizedDescription
            ? "text.primary"
            : "text.secondary"
        }
        sx={{
          whiteSpace: "pre-line",
          lineHeight: 1.7,
          overflowWrap: "anywhere",
        }}
      >
        {normalizedDescription ||
          "Nenhuma descrição foi informada para este chamado."}
      </Typography>
    </Paper>
  );
}