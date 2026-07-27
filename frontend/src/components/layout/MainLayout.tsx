import { useState } from "react";
import type { ReactNode } from "react";

import {
  Box,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import Header from "./Header";

import Sidebar, {
  collapsedDrawerWidth,
  drawerWidth,
} from "./Sidebar";

interface MainLayoutProps {
  title: string;
  children: ReactNode;
}

function MainLayout({
  title,
  children,
}: MainLayoutProps) {
  const theme = useTheme();

  const isMobile = useMediaQuery(
    theme.breakpoints.down("md")
  );

  const [desktopSidebarOpen, setDesktopSidebarOpen] =
    useState(true);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  function handleToggleSidebar() {
    if (isMobile) {
      setMobileSidebarOpen((currentValue) => !currentValue);
      return;
    }

    setDesktopSidebarOpen(
      (currentValue) => !currentValue
    );
  }

  function handleCloseMobileSidebar() {
    setMobileSidebarOpen(false);
  }

  const currentDrawerWidth = desktopSidebarOpen
    ? drawerWidth
    : collapsedDrawerWidth;

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <Header
        title={title}
        onToggleSidebar={handleToggleSidebar}
      />

      <Sidebar
        desktopOpen={desktopSidebarOpen}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={handleCloseMobileSidebar}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          minHeight: "100vh",
          width: {
            xs: "100%",
            md: `calc(100% - ${currentDrawerWidth}px)`,
          },
          backgroundColor: "background.default",
          p: {
            xs: 2,
            sm: 3,
          },
          transition: theme.transitions.create(
            ["width", "margin", "background-color"],
            {
              easing:
                theme.transitions.easing.sharp,
              duration:
                theme.transitions.duration.enteringScreen,
            }
          ),
        }}
      >
        <Toolbar />

        {children}
      </Box>
    </Box>
  );
}

export default MainLayout;