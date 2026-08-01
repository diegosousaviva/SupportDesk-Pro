import {
  Box,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

interface DashboardEfficiencyProps {
  resolvedTickets: number;
  totalTickets: number;
  resolvedPercentage: number;
}

export default function DashboardEfficiency({
  resolvedTickets,
  totalTickets,
  resolvedPercentage,
}: DashboardEfficiencyProps) {
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
          Eficiência do suporte
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Percentual de chamados resolvidos no período selecionado.
        </Typography>
      </Stack>

      <Box
        sx={{
          minHeight: 230,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 150,
            height: 150,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "14px solid",
            borderColor: "success.main",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(46, 125, 50, 0.12)"
                : "rgba(46, 125, 50, 0.08)",
          }}
        >
          <Box>
            <Typography
              variant="h3"
              fontWeight={800}
              color="success.main"
            >
              {resolvedPercentage}%
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              resolvidos
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          {resolvedTickets} de {totalTickets} chamado
          {totalTickets === 1 ? "" : "s"} foram resolvidos.
        </Typography>
      </Box>
    </Paper>
  );
}