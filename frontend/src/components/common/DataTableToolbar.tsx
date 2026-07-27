import { type ReactNode } from "react";

import { Box } from "@mui/material";

interface DataTableToolbarProps {
  children: ReactNode;
}

function DataTableToolbar({
  children,
}: DataTableToolbarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
        mb: 3,
      }}
    >
      {children}
    </Box>
  );
}

export default DataTableToolbar;