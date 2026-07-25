import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";

import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import LogoutIcon from "@mui/icons-material/Logout";

interface HeaderProps {
  title: string;
}

function Header({ title }: HeaderProps) {
  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={1}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
          }}
        >
          {title}
        </Typography>

        <IconButton>
          <NotificationsNoneIcon />
        </IconButton>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            ml: 2,
          }}
        >
          <Avatar
            sx={{
              bgcolor: "primary.main",
            }}
          >
            D
          </Avatar>

          <Typography
            sx={{
              fontWeight: 600,
            }}
          >
            Diego
          </Typography>

          <IconButton color="error">
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;