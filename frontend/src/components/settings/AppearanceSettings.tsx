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

export interface AppearanceSettingsData {
  compactMode: boolean;
  preferredTheme:
    | "light"
    | "dark"
    | "system";
  language: "pt-BR" | "en-US";
}

interface AppearanceSettingsProps {
  settings: AppearanceSettingsData;
  onSwitchChange: (
    field: "compactMode",
    checked: boolean
  ) => void;
  onSelectChange: (
    field:
      | "preferredTheme"
      | "language",
    value: string
  ) => void;
}

function AppearanceSettings({
  settings,
  onSwitchChange,
  onSelectChange,
}: AppearanceSettingsProps) {
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
          <PaletteOutlined
            color="primary"
          />

          <Typography
            variant="h6"
            fontWeight={700}
          >
            Aparência
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Defina o tema, a densidade visual e o idioma da interface.
        </Typography>

        <FormControl fullWidth>
          <InputLabel id="preferred-theme-label">
            Tema preferido
          </InputLabel>

          <Select
            labelId="preferred-theme-label"
            label="Tema preferido"
            value={
              settings.preferredTheme
            }
            onChange={(event) =>
              onSelectChange(
                "preferredTheme",
                event.target.value
              )
            }
          >
            <MenuItem value="light">
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <LightModeOutlined
                  fontSize="small"
                />

                <span>Claro</span>
              </Stack>
            </MenuItem>

            <MenuItem value="dark">
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <DarkModeOutlined
                  fontSize="small"
                />

                <span>Escuro</span>
              </Stack>
            </MenuItem>

            <MenuItem value="system">
              Sistema
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="language-label">
            Idioma
          </InputLabel>

          <Select
            labelId="language-label"
            label="Idioma"
            value={settings.language}
            onChange={(event) =>
              onSelectChange(
                "language",
                event.target.value
              )
            }
            startAdornment={
              <LanguageOutlined
                fontSize="small"
                sx={{
                  mr: 1,
                  color:
                    "text.secondary",
                }}
              />
            }
          >
            <MenuItem value="pt-BR">
              Português (Brasil)
            </MenuItem>

            <MenuItem value="en-US">
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
              onChange={(event) =>
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
              spacing={1}
              alignItems="center"
            >
              <FormatSizeOutlined
                fontSize="small"
              />

              <span>
                Usar modo compacto
              </span>
            </Stack>
          }
        />
      </Stack>
    </Paper>
  );
}

export default AppearanceSettings;