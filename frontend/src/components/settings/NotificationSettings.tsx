import {
  NotificationsOutlined,
} from "@mui/icons-material";

import {
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Typography,
} from "@mui/material";

import {
  useLanguage,
} from "../../contexts/LanguageContext";

export interface NotificationSettingsData {
  notifyNewTicket: boolean;

  notifyStatusChange: boolean;

  notifyCriticalTicket: boolean;

  notifyAssignedTicket: boolean;

  notifySlaExpired: boolean;
}

interface NotificationSettingsProps {
  settings:
    NotificationSettingsData;

  onChange: (
    field:
      keyof NotificationSettingsData,
    checked:
      boolean
  ) => void;
}

function NotificationSettings({
  settings,
  onChange,
}: NotificationSettingsProps) {
  const {
    t,
  } =
    useLanguage();

  return (
    <Paper
      variant="outlined"
      sx={{
        p: {
          xs:
            2.5,

          md:
            3,
        },

        height:
          "100%",
      }}
    >
      <Stack
        spacing={
          2.5
        }
      >
        <Stack
          direction="row"
          spacing={
            1.5
          }
          alignItems="center"
        >
          <NotificationsOutlined
            color="primary"
          />

          <Typography
            variant="h6"
            fontWeight={
              700
            }
          >
            {t(
              "notifications.title"
            )}
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {t(
            "notifications.description"
          )}
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={
                settings.notifyNewTicket
              }
              onChange={(
                event
              ) =>
                onChange(
                  "notifyNewTicket",
                  event.target.checked
                )
              }
            />
          }
          label={t(
            "notifications.newTicket"
          )}
        />

        <FormControlLabel
          control={
            <Switch
              checked={
                settings.notifyStatusChange
              }
              onChange={(
                event
              ) =>
                onChange(
                  "notifyStatusChange",
                  event.target.checked
                )
              }
            />
          }
          label={t(
            "notifications.statusChange"
          )}
        />

        <FormControlLabel
          control={
            <Switch
              checked={
                settings.notifyCriticalTicket
              }
              onChange={(
                event
              ) =>
                onChange(
                  "notifyCriticalTicket",
                  event.target.checked
                )
              }
            />
          }
          label={t(
            "notifications.criticalTicket"
          )}
        />

        <FormControlLabel
          control={
            <Switch
              checked={
                settings.notifyAssignedTicket
              }
              onChange={(
                event
              ) =>
                onChange(
                  "notifyAssignedTicket",
                  event.target.checked
                )
              }
            />
          }
          label={t(
            "notifications.assignedTicket"
          )}
        />

        <FormControlLabel
          control={
            <Switch
              checked={
                settings.notifySlaExpired
              }
              onChange={(
                event
              ) =>
                onChange(
                  "notifySlaExpired",
                  event.target.checked
                )
              }
            />
          }
          label={t(
            "notifications.slaExpired"
          )}
        />
      </Stack>
    </Paper>
  );
}

export default NotificationSettings;