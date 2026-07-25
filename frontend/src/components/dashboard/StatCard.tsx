import { Paper, Typography } from "@mui/material";

interface StatCardProps {
  title: string;
  value: number;
  color?: string;
}

export default function StatCard({
  title,
  value,
  color = "#1976d2",
}: StatCardProps) {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderLeft: `6px solid ${color}`,
        borderRadius: 2,
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {title}
      </Typography>

      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ mt: 1 }}
      >
        {value}
      </Typography>
    </Paper>
  );
}