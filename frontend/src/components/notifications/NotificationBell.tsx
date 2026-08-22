import {
  Badge,
  IconButton,
  Tooltip,
} from "@mui/material";

import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";

import {
  useNotifications,
} from "../../contexts/NotificationContext";

import {
  useLanguage,
} from "../../contexts/LanguageContext";

interface NotificationBellProps {
  onClick: () => void;
}

function NotificationBell({
  onClick,
}: NotificationBellProps) {
  const {
    unreadCount,
  } =
    useNotifications();

  const {
    t,
  } =
    useLanguage();

  return (
    <Tooltip
      title={t(
        "notifications.title"
      )}
    >
      <IconButton
        color="inherit"
        onClick={
          onClick
        }
        aria-label={t(
          "notifications.title"
        )}
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