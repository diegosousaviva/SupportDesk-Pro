import type { ReactNode } from "react";

import {
  Paper,
  type PaperProps,
} from "@mui/material";

interface PageCardProps extends PaperProps {
  children: ReactNode;
}

function PageCard({
  children,
  sx,
  ...rest
}: PageCardProps) {
  return (
    <Paper
      elevation={2}
      sx={[
        {
          p: 3,
          mt: 3,
          borderRadius: 3,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...rest}
    >
      {children}
    </Paper>
  );
}

export default PageCard;