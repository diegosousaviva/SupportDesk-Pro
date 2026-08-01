import type {
  ReactNode,
} from "react";

import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  color?: string;
  icon?: ReactNode;
}

export default function StatCard({
  title,
  value,
  suffix = "",
  color = "#1976d2",
  icon,
}: StatCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderLeft: `6px solid ${color}`,
        borderRadius: 2,
        transition:
          "transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
          borderColor: color,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={500}
          >
            {title}
          </Typography>

          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ mt: 1 }}
          >
            {value}
            {suffix}
          </Typography>
        </Box>

        {icon && (
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color,
              backgroundColor: `${color}18`,
              "& svg": {
                fontSize: 28,
              },
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
    </Paper>
  );
}