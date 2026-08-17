import {
  AccessTimeOutlined,
  LockOutlined,
  SecurityOutlined,
  TimerOutlined,
} from "@mui/icons-material";

import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Typography,
} from "@mui/material";

export interface SecuritySettingsData {
  sessionTimeoutMinutes: number;
  maximumSessionDurationMinutes: number;
  requireStrongPassword: boolean;
  automaticLogout: boolean;
}

interface SecuritySettingsProps {
  settings: SecuritySettingsData;

  onSwitchChange: (
    field:
      | "requireStrongPassword"
      | "automaticLogout",
    checked: boolean
  ) => void;

  onSessionTimeoutChange: (
    value: number
  ) => void;

  onMaximumSessionDurationChange: (
    value: number
  ) => void;
}

function SecuritySettings({
  settings,
  onSwitchChange,
  onSessionTimeoutChange,
  onMaximumSessionDurationChange,
}: SecuritySettingsProps) {
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
          <SecurityOutlined
            color="primary"
          />

          <Typography
            variant="h6"
            fontWeight={700}
          >
            Segurança
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Defina regras de sessão e políticas básicas de segurança.
        </Typography>

        <FormControl fullWidth>
          <InputLabel id="session-timeout-label">
            Tempo de inatividade
          </InputLabel>

          <Select
            labelId="session-timeout-label"
            label="Tempo de inatividade"
            value={
              settings.sessionTimeoutMinutes
            }
            onChange={(event) =>
              onSessionTimeoutChange(
                Number(
                  event.target.value
                )
              )
            }
            startAdornment={
              <TimerOutlined
                fontSize="small"
                sx={{
                  mr: 1,
                  color:
                    "text.secondary",
                }}
              />
            }
          >
            <MenuItem value={1}>
              1 minuto
            </MenuItem>

            <MenuItem value={15}>
              15 minutos
            </MenuItem>

            <MenuItem value={30}>
              30 minutos
            </MenuItem>

            <MenuItem value={60}>
              1 hora
            </MenuItem>

            <MenuItem value={120}>
              2 horas
            </MenuItem>

            <MenuItem value={480}>
              8 horas
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="maximum-session-duration-label">
            Duração máxima da sessão
          </InputLabel>

          <Select
            labelId="maximum-session-duration-label"
            label="Duração máxima da sessão"
            value={
              settings.maximumSessionDurationMinutes
            }
            onChange={(event) =>
              onMaximumSessionDurationChange(
                Number(
                  event.target.value
                )
              )
            }
            startAdornment={
              <AccessTimeOutlined
                fontSize="small"
                sx={{
                  mr: 1,
                  color:
                    "text.secondary",
                }}
              />
            }
          >
            <MenuItem value={1}>
              1 minuto
            </MenuItem>

            <MenuItem value={60}>
              1 hora
            </MenuItem>

            <MenuItem value={240}>
              4 horas
            </MenuItem>

            <MenuItem value={480}>
              8 horas
            </MenuItem>

            <MenuItem value={720}>
              12 horas
            </MenuItem>

            <MenuItem value={1440}>
              24 horas
            </MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={
                settings.requireStrongPassword
              }
              onChange={(event) =>
                onSwitchChange(
                  "requireStrongPassword",
                  event.target.checked
                )
              }
            />
          }
          label={
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <LockOutlined
                fontSize="small"
              />

              <span>
                Exigir senha forte
              </span>
            </Stack>
          }
        />

        <FormControlLabel
          control={
            <Switch
              checked={
                settings.automaticLogout
              }
              onChange={(event) =>
                onSwitchChange(
                  "automaticLogout",
                  event.target.checked
                )
              }
            />
          }
          label="Encerrar a sessão automaticamente após o período de inatividade"
        />

        <Typography
          variant="caption"
          color="text.secondary"
        >
          O tempo de inatividade controla o logout automático sem interação. A duração máxima limita o tempo total da sessão, mesmo com o usuário ativo.
        </Typography>
      </Stack>
    </Paper>
  );
}

export default SecuritySettings;