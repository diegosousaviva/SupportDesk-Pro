import { Box, Button, Typography } from "@mui/material";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

export default function PageHeader({
  title,
  subtitle,
  buttonLabel,
  onButtonClick,
}: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: {
          xs: "flex-start",
          sm: "center",
        },
        flexDirection: {
          xs: "column",
          sm: "row",
        },
        gap: 2,
        mb: 3,
      }}
    >
      <Box>
        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {buttonLabel && onButtonClick && (
        <Button
          variant="contained"
          onClick={onButtonClick}
        >
          {buttonLabel}
        </Button>
      )}
    </Box>
  );
}