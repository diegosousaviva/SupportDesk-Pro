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

import {
  useLanguage,
} from "../../contexts/LanguageContext";

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
  const {
    t,
  } =
    useLanguage();

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
            {t(
              "security.title"
            )}
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {t(
            "security.description"
          )}
        </Typography>

        <FormControl fullWidth>
          <InputLabel id="session-timeout-label">
            {t(
              "security.inactivityTimeout"
            )}
          </InputLabel>

          <Select
            labelId="session-timeout-label"
            label={t(
              "security.inactivityTimeout"
            )}
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
              {t(
                "security.oneMinute"
              )}
            </MenuItem>

            <MenuItem value={15}>
              {t(
                "security.fifteenMinutes"
              )}
            </MenuItem>

            <MenuItem value={30}>
              {t(
                "security.thirtyMinutes"
              )}
            </MenuItem>

            <MenuItem value={60}>
              {t(
                "security.oneHour"
              )}
            </MenuItem>

            <MenuItem value={120}>
              {t(
                "security.twoHours"
              )}
            </MenuItem>

            <MenuItem value={480}>
              {t(
                "security.eightHours"
              )}
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="maximum-session-duration-label">
            {t(
              "security.maximumSessionDuration"
            )}
          </InputLabel>

          <Select
            labelId="maximum-session-duration-label"
            label={t(
              "security.maximumSessionDuration"
            )}
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
              {t(
                "security.oneMinute"
              )}
            </MenuItem>

            <MenuItem value={60}>
              {t(
                "security.oneHour"
              )}
            </MenuItem>

            <MenuItem value={240}>
              {t(
                "security.fourHours"
              )}
            </MenuItem>

            <MenuItem value={480}>
              {t(
                "security.eightHours"
              )}
            </MenuItem>

            <MenuItem value={720}>
              {t(
                "security.twelveHours"
              )}
            </MenuItem>

            <MenuItem value={1440}>
              {t(
                "security.twentyFourHours"
              )}
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
                {t(
                  "security.strongPassword"
                )}
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
          label={t(
            "security.automaticLogout"
          )}
        />

        <Typography
          variant="caption"
          color="text.secondary"
        >
          {t(
            "security.help"
          )}
        </Typography>
      </Stack>
    </Paper>
  );
}

export default SecuritySettings;