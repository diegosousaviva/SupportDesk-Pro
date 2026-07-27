import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

import { useColorMode } from "../../contexts/ColorModeContext";

interface HeaderProps {
  title: string;
  onToggleSidebar: () => void;
}

function Header({
  title,
  onToggleSidebar,
}: HeaderProps) {
  const navigate = useNavigate();
  const { mode, toggleColorMode } = useColorMode();

  const [
    notificationsAnchorElement,
    setNotificationsAnchorElement,
  ] = useState<null | HTMLElement>(null);

  const [
    userMenuAnchorElement,
    setUserMenuAnchorElement,
  ] = useState<null | HTMLElement>(null);

  const notificationsMenuOpen = Boolean(
    notificationsAnchorElement
  );

  const userMenuOpen = Boolean(
    userMenuAnchorElement
  );

  function handleOpenNotificationsMenu(
    event: React.MouseEvent<HTMLElement>
  ) {
    setNotificationsAnchorElement(
      event.currentTarget
    );
  }

  function handleCloseNotificationsMenu() {
    setNotificationsAnchorElement(null);
  }

  function handleOpenUserMenu(
    event: React.MouseEvent<HTMLElement>
  ) {
    setUserMenuAnchorElement(event.currentTarget);
  }

  function handleCloseUserMenu() {
    setUserMenuAnchorElement(null);
  }

  function handleNavigateToSettings() {
    handleCloseUserMenu();
    navigate("/settings");
  }

  function handleLogout() {
    handleCloseUserMenu();
    navigate("/login");
  }

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        zIndex: (theme) =>
          theme.zIndex.drawer + 1,
        borderBottom: "1px solid",
        borderColor: "divider",
        backdropFilter: "blur(12px)",
        backgroundColor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(30, 41, 59, 0.92)"
            : "rgba(255, 255, 255, 0.92)",
      }}
    >
      <Toolbar>
        <Tooltip title="Abrir ou recolher menu">
          <IconButton
            edge="start"
            onClick={onToggleSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        </Tooltip>

        <Typography
          variant="h6"
          noWrap
          sx={{
            flexGrow: 1,
            fontWeight: 600,
          }}
        >
          {title}
        </Typography>

        <Tooltip
          title={
            mode === "light"
              ? "Ativar modo escuro"
              : "Ativar modo claro"
          }
        >
          <IconButton
            onClick={toggleColorMode}
            sx={{ mr: 0.5 }}
          >
            {mode === "light" ? (
              <DarkModeIcon />
            ) : (
              <LightModeIcon />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title="Notificações">
          <IconButton
            onClick={handleOpenNotificationsMenu}
          >
            <Badge
              badgeContent={3}
              color="error"
              max={9}
            >
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            ml: {
              xs: 1,
              sm: 2,
            },
          }}
        >
          <Tooltip title="Menu do usuário">
            <IconButton
              onClick={handleOpenUserMenu}
              sx={{ p: 0 }}
            >
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 38,
                  height: 38,
                }}
              >
                D
              </Avatar>
            </IconButton>
          </Tooltip>

          <Typography
            sx={{
              display: {
                xs: "none",
                sm: "block",
              },
              fontWeight: 600,
              ml: 1.5,
            }}
          >
            Diego
          </Typography>
        </Box>

        <Menu
          anchorEl={notificationsAnchorElement}
          open={notificationsMenuOpen}
          onClose={handleCloseNotificationsMenu}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          slotProps={{
            paper: {
              sx: {
                mt: 1.5,
                width: 320,
                maxWidth: "calc(100vw - 32px)",
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography fontWeight={700}>
              Notificações
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Você possui 3 atualizações.
            </Typography>
          </Box>

          <Divider />

          <MenuItem
            onClick={handleCloseNotificationsMenu}
            sx={{
              whiteSpace: "normal",
              alignItems: "flex-start",
              py: 1.5,
            }}
          >
            <Box>
              <Typography
                variant="body2"
                fontWeight={600}
              >
                Novo chamado aberto
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Um novo chamado de hardware foi
                registrado.
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem
            onClick={handleCloseNotificationsMenu}
            sx={{
              whiteSpace: "normal",
              alignItems: "flex-start",
              py: 1.5,
            }}
          >
            <Box>
              <Typography
                variant="body2"
                fontWeight={600}
              >
                Chamado atualizado
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                O status de um chamado foi alterado.
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem
            onClick={handleCloseNotificationsMenu}
            sx={{
              whiteSpace: "normal",
              alignItems: "flex-start",
              py: 1.5,
            }}
          >
            <Box>
              <Typography
                variant="body2"
                fontWeight={600}
              >
                Chamado crítico
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Existe um chamado com prioridade
                crítica.
              </Typography>
            </Box>
          </MenuItem>
        </Menu>

        <Menu
          anchorEl={userMenuAnchorElement}
          open={userMenuOpen}
          onClose={handleCloseUserMenu}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          slotProps={{
            paper: {
              sx: {
                mt: 1.5,
                minWidth: 210,
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography fontWeight={700}>
              Diego
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Administrador
            </Typography>
          </Box>

          <Divider />

          <MenuItem onClick={handleCloseUserMenu}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />git add .
            </ListItemIcon>

            Meu perfil
          </MenuItem>

          <MenuItem
            onClick={handleNavigateToSettings}
          >
            <ListItemIcon>
              <SettingsOutlinedIcon fontSize="small" />
            </ListItemIcon>

            Configurações
          </MenuItem>

          <Divider />

          <MenuItem
            onClick={handleLogout}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <LogoutIcon
                fontSize="small"
                color="error"
              />
            </ListItemIcon>

            Sair
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Header;