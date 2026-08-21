import {
  DarkModeOutlined,
  FormatSizeOutlined,
  LanguageOutlined,
  LightModeOutlined,
  PaletteOutlined,
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

export interface AppearanceSettingsData {
  compactMode: boolean;

  preferredTheme:
    | "light"
    | "dark"
    | "system";

  language:
    | "pt-BR"
    | "en-US";
}

interface AppearanceSettingsProps {
  settings:
    AppearanceSettingsData;

  onSwitchChange: (
    field:
      "compactMode",
    checked:
      boolean
  ) => void;

  onSelectChange: (
    field:
      | "preferredTheme"
      | "language",
    value:
      string
  ) => void;
}

function AppearanceSettings({
  settings,
  onSwitchChange,
  onSelectChange,
}: AppearanceSettingsProps) {
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
          <PaletteOutlined
            color="primary"
          />

          <Typography
            variant="h6"
            fontWeight={
              700
            }
          >
            {t(
              "appearance.title"
            )}
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {t(
            "appearance.description"
          )}
        </Typography>

        <FormControl
          fullWidth
        >
          <InputLabel
            id="preferred-theme-label"
          >
            {t(
              "appearance.theme"
            )}
          </InputLabel>

          <Select
            labelId="preferred-theme-label"
            label={t(
              "appearance.theme"
            )}
            value={
              settings.preferredTheme
            }
            onChange={(
              event
            ) =>
              onSelectChange(
                "preferredTheme",
                event.target.value
              )
            }
          >
            <MenuItem
              value="light"
            >
              <Stack
                direction="row"
                spacing={
                  1
                }
                alignItems="center"
              >
                <LightModeOutlined
                  fontSize="small"
                />

                <span>
                  {t(
                    "appearance.theme.light"
                  )}
                </span>
              </Stack>
            </MenuItem>

            <MenuItem
              value="dark"
            >
              <Stack
                direction="row"
                spacing={
                  1
                }
                alignItems="center"
              >
                <DarkModeOutlined
                  fontSize="small"
                />

                <span>
                  {t(
                    "appearance.theme.dark"
                  )}
                </span>
              </Stack>
            </MenuItem>

            <MenuItem
              value="system"
            >
              {t(
                "appearance.theme.system"
              )}
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl
          fullWidth
        >
          <InputLabel
            id="language-label"
          >
            {t(
              "appearance.language"
            )}
          </InputLabel>

          <Select
            labelId="language-label"
            label={t(
              "appearance.language"
            )}
            value={
              settings.language
            }
            onChange={(
              event
            ) =>
              onSelectChange(
                "language",
                event.target.value
              )
            }
            startAdornment={
              <LanguageOutlined
                fontSize="small"
                sx={{
                  mr:
                    1,

                  color:
                    "text.secondary",
                }}
              />
            }
          >
            <MenuItem
              value="pt-BR"
            >
              Português (Brasil)
            </MenuItem>

            <MenuItem
              value="en-US"
            >
              English (United States)
            </MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={
                settings.compactMode
              }
              onChange={(
                event
              ) =>
                onSwitchChange(
                  "compactMode",
                  event.target.checked
                )
              }
            />
          }
          label={
            <Stack
              direction="row"
              spacing={
                1
              }
              alignItems="center"
            >
              <FormatSizeOutlined
                fontSize="small"
              />

              <span>
                {t(
                  "appearance.compact"
                )}
              </span>
            </Stack>
          }
        />
      </Stack>
    </Paper>
  );
}

export default AppearanceSettings;