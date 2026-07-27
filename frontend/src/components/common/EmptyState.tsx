import { type ReactNode } from "react";

import {
  Box,
  Button,
  Typography,
} from "@mui/material";

import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        py: 8,
        px: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          color: "text.secondary",
          mb: 2,
        }}
      >
        {icon ?? (
          <InboxOutlinedIcon
            sx={{
              fontSize: 72,
            }}
          />
        )}
      </Box>

      <Typography
        variant="h6"
        fontWeight={700}
        gutterBottom
      >
        {title}
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          maxWidth: 420,
          mb: actionLabel ? 3 : 0,
        }}
      >
        {description}
      </Typography>

      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}

export default EmptyState;