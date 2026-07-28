import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type {
  MouseEvent,
} from "react";

import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { useAuth } from "../../contexts/AuthContext";

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

function getUserInitials(name: string) {
  const normalizedName = name.trim();

  if (!normalizedName) {
    return "U";
  }

  const nameParts = normalizedName
    .split(/\s+/)
    .filter(Boolean);

  if (nameParts.length === 1) {
    return nameParts[0]
      .charAt(0)
      .toUpperCase();
  }

  const firstInitial = nameParts[0]
    .charAt(0)
    .toUpperCase();

  const lastInitial = nameParts[
    nameParts.length - 1
  ]
    .charAt(0)
    .toUpperCase();

  return `${firstInitial}${lastInitial}`;
}

function Header({
  title = "SupportDesk Pro",
  onMenuClick,
}: HeaderProps) {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [
    menuAnchorElement,
    setMenuAnchorElement,
  ] = useState<HTMLElement | null>(null);

  const isUserMenuOpen =
    Boolean(menuAnchorElement);

  function handleOpenUserMenu(
    event: MouseEvent<HTMLElement>
  ) {
    setMenuAnchorElement(
      event.currentTarget
    );
  }

  function handleCloseUserMenu() {
    setMenuAnchorElement(null);
  }

  function handleProfile() {
    handleCloseUserMenu();

    if (!user) {
      return;
    }

    navigate(`/users/${user.id}`);
  }

  function handleLogout() {
    handleCloseUserMenu();

    logout();

    navigate("/login", {
      replace: true,
    });
  }

  const userName =
    user?.name ?? "Usuário";

  const userRole =
    user?.role ?? "";

  const userInitials =
    getUserInitials(userName);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="default"
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        backgroundColor:
          "background.paper",
      }}
    >
      <Toolbar
        sx={{
          minHeight: {
            xs: 64,
            sm: 72,
          },
          px: {
            xs: 2,
            sm: 3,
          },
        }}
      >
        {onMenuClick && (
          <Tooltip title="Abrir menu">
            <IconButton
              edge="start"
              color="inherit"
              aria-label="Abrir menu lateral"
              onClick={onMenuClick}
              sx={{
                mr: 2,
              }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
        )}

        <Typography
          variant="h6"
          component="h1"
          fontWeight={700}
          noWrap
          sx={{
            flexGrow: 1,
          }}
        >
          {title}
        </Typography>

        <Box>
          <Tooltip title="Opções do usuário">
            <Box
              component="button"
              type="button"
              onClick={
                handleOpenUserMenu
              }
              aria-label="Abrir opções do usuário"
              aria-controls={
                isUserMenuOpen
                  ? "user-menu"
                  : undefined
              }
              aria-haspopup="true"
              aria-expanded={
                isUserMenuOpen
                  ? "true"
                  : undefined
              }
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                minWidth: 0,
                p: 0.75,
                border: 0,
                borderRadius: 2,
                color: "text.primary",
                backgroundColor:
                  "transparent",
                cursor: "pointer",
                font: "inherit",
                transition:
                  "background-color 0.2s",
                "&:hover": {
                  backgroundColor:
                    "action.hover",
                },
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "primary.main",
                  color:
                    "primary.contrastText",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                }}
              >
                {userInitials}
              </Avatar>

              <Stack
                spacing={0}
                sx={{
                  display: {
                    xs: "none",
                    sm: "flex",
                  },
                  minWidth: 0,
                  textAlign: "left",
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={700}
                  noWrap
                  sx={{
                    maxWidth: 180,
                  }}
                >
                  {userName}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                >
                  {userRole}
                </Typography>
              </Stack>

              <KeyboardArrowDownIcon
                fontSize="small"
                sx={{
                  display: {
                    xs: "none",
                    sm: "block",
                  },
                  transform:
                    isUserMenuOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  transition:
                    "transform 0.2s",
                }}
              />
            </Box>
          </Tooltip>

          <Menu
            id="user-menu"
            anchorEl={
              menuAnchorElement
            }
            open={isUserMenuOpen}
            onClose={
              handleCloseUserMenu
            }
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
                  mt: 1,
                  minWidth: 220,
                  borderRadius: 2,
                },
              },
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
              }}
            >
              <Typography
                variant="body2"
                fontWeight={700}
                noWrap
              >
                {userName}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
              >
                {user?.email}
              </Typography>
            </Box>

            <Divider />

            <MenuItem
              onClick={handleProfile}
              disabled={!user}
            >
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>

              Meu perfil
            </MenuItem>

            <Divider />

            <MenuItem
              onClick={handleLogout}
              sx={{
                color: "error.main",
              }}
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
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;