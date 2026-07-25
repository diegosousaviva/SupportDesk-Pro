import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";

const drawerWidth = 250;

const menuItems = [
  {
    label: "Dashboard",
    icon: <DashboardIcon />,
  },
  {
    label: "Chamados",
    icon: <ConfirmationNumberIcon />,
  },
  {
    label: "Usuários",
    icon: <PeopleIcon />,
  },
  {
    label: "Relatórios",
    icon: <AssessmentIcon />,
  },
  {
    label: "Configurações",
    icon: <SettingsIcon />,
  },
];

function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,

        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      <Toolbar>
        <Box>
          <Typography variant="h6" color="primary" fontWeight={700}>
            SupportDesk Pro
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Central de Suporte
          </Typography>
        </Box>
      </Toolbar>

      <Divider />

      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item, index) => (
          <ListItemButton
            key={item.label}
            selected={index === 0}
            sx={{
              mb: 0.5,
              borderRadius: 2,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 42,
                color: index === 0 ? "primary.main" : "text.secondary",
              }}
            >
              {item.icon}
            </ListItemIcon>

            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;

export { drawerWidth };