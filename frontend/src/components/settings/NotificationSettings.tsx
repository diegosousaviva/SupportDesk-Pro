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

export interface NotificationSettingsData {
  notifyNewTicket: boolean;
  notifyStatusChange: boolean;
  notifyCriticalTicket: boolean;
  notifyAssignedTicket: boolean;
  notifySlaExpired: boolean;
}

interface NotificationSettingsProps {
  settings: NotificationSettingsData;
  onChange: (
    field: keyof NotificationSettingsData,
    checked: boolean
  ) => void;
}

function NotificationSettings({
  settings,
  onChange,
}: NotificationSettingsProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: {
          xs: 2.5,
          md: 3,
        },
        height: "100%",
      }}
    >
      <Stack spacing={2.5}>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
        >
          <NotificationsOutlined
            color="primary"
          />

          <Typography
            variant="h6"
            fontWeight={700}
          >
            Notificações
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Escolha quais eventos devem gerar alertas no sistema.
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={
                settings.notifyNewTicket
              }
              onChange={(event) =>
                onChange(
                  "notifyNewTicket",
                  event.target.checked
                )
              }
            />
          }
          label="Notificar novos chamados"
        />

        <FormControlLabel
          control={
            <Switch
              checked={
                settings.notifyStatusChange
              }
              onChange={(event) =>
                onChange(
                  "notifyStatusChange",
                  event.target.checked
                )
              }
            />
          }
          label="Notificar mudanças de status"
        />

        <FormControlLabel
          control={
            <Switch
              checked={
                settings.notifyCriticalTicket
              }
              onChange={(event) =>
                onChange(
                  "notifyCriticalTicket",
                  event.target.checked
                )
              }
            />
          }
          label="Notificar chamados críticos"
        />

        <FormControlLabel
          control={
            <Switch
              checked={
                settings.notifyAssignedTicket
              }
              onChange={(event) =>
                onChange(
                  "notifyAssignedTicket",
                  event.target.checked
                )
              }
            />
          }
          label="Notificar chamados atribuídos"
        />

        <FormControlLabel
          control={
            <Switch
              checked={
                settings.notifySlaExpired
              }
              onChange={(event) =>
                onChange(
                  "notifySlaExpired",
                  event.target.checked
                )
              }
            />
          }
          label="Notificar chamados com SLA vencido"
        />
      </Stack>
    </Paper>
  );
}

export default NotificationSettings;