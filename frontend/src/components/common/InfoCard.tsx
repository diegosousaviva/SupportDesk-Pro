import type {
  ReactNode,
} from "react";

import {
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

interface InfoCardProps {
  title: string;

  icon?: ReactNode;

  children: ReactNode;

  actions?: ReactNode;
}

function InfoCard({
  title,
  icon,
  children,
  actions,
}: InfoCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: {
          xs: 2.5,
          md: 3,
        },

        borderRadius: 3,

        transition:
          "all .2s ease",

        "&:hover": {
          boxShadow: 3,
        },
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            {icon}

            <Typography
              variant="h6"
              fontWeight={700}
            >
              {title}
            </Typography>
          </Stack>

          {actions}
        </Stack>

        <Divider />

        {children}
      </Stack>
    </Paper>
  );
}

export default InfoCard;