import {
  Badge,
  IconButton,
  Tooltip,
} from "@mui/material";

import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";

import { useNotifications } from "../../contexts/NotificationContext";

interface NotificationBellProps {
  onClick: () => void;
}

function NotificationBell({
  onClick,
}: NotificationBellProps) {
  const {
    unreadCount,
  } = useNotifications();

  return (
    <Tooltip title="Notificações">
      <IconButton
        color="inherit"
        onClick={onClick}
      >
        <Badge
          badgeContent={
            unreadCount
          }
          color="error"
          max={99}
        >
          <NotificationsOutlinedIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}

export default NotificationBell;