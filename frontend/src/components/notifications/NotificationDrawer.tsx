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

import {
  useLanguage,
} from "../../contexts/LanguageContext";

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
  } =
    useNotifications();

  const {
    language,
    t,
  } =
    useLanguage();

  function handleClearAll():
    void {
    const confirmed =
      window.confirm(
        t(
          "notifications.deleteAllConfirm"
        )
      );

    if (!confirmed) {
      return;
    }

    clearNotifications();
  }

  function handleNotificationClick(
    notification:
      AppNotification
  ): void {
    if (
      !notification.read
    ) {
      markAsRead(
        notification.id
      );
    }

    onClose();

    onNotificationClick?.(
      notification
    );
  }

  function getDeleteNotificationLabel(
    notification:
      AppNotification
  ): string {
    return `${t(
      "notifications.delete"
    )}: ${notification.title}`;
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

          display:
            "flex",

          flexDirection:
            "column",

          height:
            "100%",
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
              {t(
                "notifications.title"
              )}
            </Typography>
          </Stack>

          <Stack
            direction="row"
          >
            <Tooltip
              title={t(
                "notifications.markAllAsRead"
              )}
            >
              <span>
                <IconButton
                  onClick={
                    markAllAsRead
                  }
                  aria-label={t(
                    "notifications.markAllAsRead"
                  )}
                  disabled={
                    unreadCount ===
                    0
                  }
                >
                  <DoneAllOutlined />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip
              title={t(
                "notifications.deleteAll"
              )}
            >
              <span>
                <IconButton
                  onClick={
                    handleClearAll
                  }
                  aria-label={t(
                    "notifications.deleteAllAria"
                  )}
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

            <Tooltip
              title={t(
                "notifications.close"
              )}
            >
              <IconButton
                onClick={onClose}
                aria-label={t(
                  "notifications.closeAria"
                )}
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
            overflowY:
              "auto",
          }}
        >
          {notifications.length ===
          0 ? (
            <Box
              sx={{
                p: 4,
                textAlign:
                  "center",
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
                {t(
                  "notifications.empty"
                )}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                {t(
                  "notifications.emptyDescription"
                )}
              </Typography>
            </Box>
          ) : (
            notifications.map(
              (
                notification
              ) => (
                <ListItem
                  key={
                    notification.id
                  }
                  disablePadding
                  divider
                  secondaryAction={
                    <Tooltip
                      title={t(
                        "notifications.delete"
                      )}
                    >
                      <IconButton
                        edge="end"
                        aria-label={getDeleteNotificationLabel(
                          notification
                        )}
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

                      "&.Mui-selected":
                        {
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

                                flexShrink:
                                  0,
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
                              language
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