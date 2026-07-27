import { useLocation, useNavigate } from "react-router-dom";

import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

const drawerWidth = 250;
const collapsedDrawerWidth = 72;

interface SidebarProps {
  desktopOpen: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const menuItems = [
  {
    label: "Dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
  },
  {
    label: "Chamados",
    icon: <ConfirmationNumberIcon />,
    path: "/tickets",
  },
  {
    label: "Usuários",
    icon: <PeopleIcon />,
    path: "/users",
  },
  {
    label: "Relatórios",
    icon: <AssessmentIcon />,
    path: "/reports",
  },
  {
    label: "Configurações",
    icon: <SettingsIcon />,
    path: "/settings",
  },
];

function SidebarContent({
  expanded,
  onNavigate,
}: {
  expanded: boolean;
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  function handleNavigate(path: string) {
    navigate(path);
    onNavigate?.();
  }

  function isCurrentRoute(path: string) {
    if (path === "/dashboard") {
      return (
        location.pathname === "/dashboard" ||
        location.pathname === "/"
      );
    }

    return location.pathname.startsWith(path);
  }

  return (
    <>
      <Toolbar
        sx={{
          justifyContent: expanded
            ? "flex-start"
            : "center",
          px: expanded ? 2 : 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: expanded ? 1.5 : 0,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            <SupportAgentIcon fontSize="large" />
          </Box>

          {expanded && (
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                color="primary"
                fontWeight={700}
                noWrap
              >
                SupportDesk Pro
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
              >
                Central de Suporte
              </Typography>
            </Box>
          )}
        </Box>
      </Toolbar>

      <Divider />

      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item) => {
          const selected = isCurrentRoute(item.path);

          const menuButton = (
            <ListItemButton
              key={item.label}
              selected={selected}
              onClick={() =>
                handleNavigate(item.path)
              }
              sx={{
                minHeight: 48,
                justifyContent: expanded
                  ? "initial"
                  : "center",
                px: expanded ? 2 : 1.5,
                mb: 0.5,
                borderRadius: 2,
                transition:
                  "background-color 200ms ease, color 200ms ease",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: expanded ? 42 : 0,
                  justifyContent: "center",
                  color: selected
                    ? "primary.main"
                    : "text.secondary",
                }}
              >
                {item.icon}
              </ListItemIcon>

              {expanded && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: selected ? 600 : 400,
                  }}
                />
              )}
            </ListItemButton>
          );

          if (expanded) {
            return menuButton;
          }

          return (
            <Tooltip
              key={item.label}
              title={item.label}
              placement="right"
            >
              {menuButton}
            </Tooltip>
          );
        })}
      </List>
    </>
  );
}

function Sidebar({
  desktopOpen,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const currentDesktopWidth = desktopOpen
    ? drawerWidth
    : collapsedDrawerWidth;

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: {
          md: 0,
        },
      }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: {
            xs: "block",
            md: "none",
          },

          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <SidebarContent
          expanded
          onNavigate={onMobileClose}
        />
      </Drawer>

      <Drawer
        variant="permanent"
        open={desktopOpen}
        sx={{
          display: {
            xs: "none",
            md: "block",
          },
          width: currentDesktopWidth,
          flexShrink: 0,
          whiteSpace: "nowrap",

          "& .MuiDrawer-paper": {
            width: currentDesktopWidth,
            boxSizing: "border-box",
            overflowX: "hidden",
            borderRight: "1px solid",
            borderColor: "divider",
            transition: (theme) =>
              theme.transitions.create("width", {
                easing:
                  theme.transitions.easing.sharp,
                duration:
                  desktopOpen
                    ? theme.transitions.duration
                        .enteringScreen
                    : theme.transitions.duration
                        .leavingScreen,
              }),
          },
        }}
      >
        <SidebarContent expanded={desktopOpen} />
      </Drawer>
    </Box>
  );
}

export default Sidebar;

export {
  collapsedDrawerWidth,
  drawerWidth,
};