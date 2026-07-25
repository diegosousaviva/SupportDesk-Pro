import { Box, Toolbar } from "@mui/material";
import type { ReactNode } from "react";

import Header from "./Header";
import Sidebar, { drawerWidth } from "./Sidebar";

interface MainLayoutProps {
  title: string;
  children: ReactNode;
}

function MainLayout({ title, children }: MainLayoutProps) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Header title={title} />

      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${drawerWidth}px)`,
          minHeight: "100vh",
          backgroundColor: "background.default",
          p: 3,
        }}
      >
        <Toolbar />

        {children}
      </Box>
    </Box>
  );
}

export default MainLayout;