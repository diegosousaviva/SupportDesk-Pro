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
      setMobileSidebarOpen(
        (currentValue) => !currentValue
      );

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
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "background.default",
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
          width: {
            xs: "100%",
            md: `calc(100% - ${currentDrawerWidth}px)`,
          },

          ml: {
            xs: 0,
            md: `${currentDrawerWidth}px`,
          },

          minWidth: 0,
          minHeight: "100vh",
          boxSizing: "border-box",
          overflowX: "hidden",

          backgroundColor: "background.default",

          transition: theme.transitions.create(
            ["width", "margin-left"],
            {
              easing:
                theme.transitions.easing.sharp,

              duration:
                theme.transitions.duration
                  .enteringScreen,
            }
          ),
        }}
      >
        <Toolbar />

        <Box
          sx={{
            width: "100%",
            minWidth: 0,
            boxSizing: "border-box",

            p: {
              xs: 2,
              sm: 3,
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;