import {
  CloseOutlined,
  DeleteOutline,
  DeleteSweepOutlined,
  DoneAllOutlined,
  NotificationsOutlined,
} from "@mui/icons-material";

import {
  Badge,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  useNotifications,
} from "../../contexts/NotificationContext";

import type {
  AppNotification,
} from "../../types/Notification";

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;

  onNotificationClick?: (
    notification: AppNotification
  ) => void;
}

function NotificationDrawer({
  open,
  onClose,
  onNotificationClick,
}: NotificationDrawerProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
  } = useNotifications();

  function handleClearAll(): void {
    const confirmed =
      window.confirm(
        "Deseja apagar todas as notificações?"
      );

    if (!confirmed) {
      return;
    }

    clearNotifications();
  }

  function handleNotificationClick(
    notification: AppNotification
  ): void {
    if (!notification.read) {
      markAsRead(
        notification.id
      );
    }

    onClose();

    onNotificationClick?.(
      notification
    );
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
    >
      <Box
        sx={{
          width: {
            xs: 320,
            sm: 380,
          },
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            p: 2,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <Badge
              color="error"
              badgeContent={
                unreadCount
              }
              max={99}
            >
              <NotificationsOutlined />
            </Badge>

            <Typography
              variant="h6"
              fontWeight={700}
            >
              Notificações
            </Typography>
          </Stack>

          <Stack direction="row">
            <Tooltip title="Marcar todas como lidas">
              <span>
                <IconButton
                  onClick={
                    markAllAsRead
                  }
                  aria-label="Marcar todas como lidas"
                  disabled={
                    unreadCount === 0
                  }
                >
                  <DoneAllOutlined />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Apagar todas">
              <span>
                <IconButton
                  onClick={
                    handleClearAll
                  }
                  aria-label="Apagar todas as notificações"
                  disabled={
                    notifications.length ===
                    0
                  }
                  color="error"
                >
                  <DeleteSweepOutlined />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Fechar">
              <IconButton
                onClick={onClose}
                aria-label="Fechar notificações"
              >
                <CloseOutlined />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Divider />

        <List
          disablePadding
          sx={{
            flex: 1,
            overflowY: "auto",
          }}
        >
          {notifications.length ===
          0 ? (
            <Box
              sx={{
                p: 4,
                textAlign: "center",
              }}
            >
              <NotificationsOutlined
                sx={{
                  mb: 1.5,
                  fontSize: 42,
                  color:
                    "text.disabled",
                }}
              />

              <Typography
                fontWeight={700}
              >
                Nenhuma notificação
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                Os novos avisos aparecerão aqui.
              </Typography>
            </Box>
          ) : (
            notifications.map(
              (notification) => (
                <ListItem
                  key={
                    notification.id
                  }
                  disablePadding
                  divider
                  secondaryAction={
                    <Tooltip title="Apagar notificação">
                      <IconButton
                        edge="end"
                        aria-label={`Apagar notificação ${notification.title}`}
                        color="error"
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();

                          removeNotification(
                            notification.id
                          );
                        }}
                      >
                        <DeleteOutline />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemButton
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                    selected={
                      !notification.read
                    }
                    sx={{
                      alignItems:
                        "flex-start",
                      px: 2,
                      py: 1.75,
                      pr: 7,

                      "&.Mui-selected": {
                        backgroundColor:
                          "action.selected",
                      },

                      "&.Mui-selected:hover":
                        {
                          backgroundColor:
                            "action.hover",
                        },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          {!notification.read && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius:
                                  "50%",
                                backgroundColor:
                                  "primary.main",
                                flexShrink: 0,
                              }}
                            />
                          )}

                          <Typography
                            variant="body2"
                            fontWeight={
                              notification.read
                                ? 500
                                : 700
                            }
                          >
                            {
                              notification.title
                            }
                          </Typography>
                        </Stack>
                      }
                      secondary={
                        <Stack
                          spacing={0.75}
                          sx={{
                            mt: 0.75,
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {
                              notification.message
                            }
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.disabled"
                          >
                            {new Date(
                              notification.createdAt
                            ).toLocaleString(
                              "pt-BR"
                            )}
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              )
            )
          )}
        </List>
      </Box>
    </Drawer>
  );
}

export default NotificationDrawer;