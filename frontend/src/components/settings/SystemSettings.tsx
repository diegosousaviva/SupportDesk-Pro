import {
  BackupOutlined,
  DeleteForeverOutlined,
  InfoOutlined,
  RestoreOutlined,
  SettingsBackupRestoreOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  useLanguage,
} from "../../contexts/LanguageContext";

interface SystemSettingsProps {
  onExportBackup:
    () => void;

  onImportBackup:
    () => void;

  onRestoreDefaults:
    () => void;

  onResetSystem:
    () => void;
}

function SystemSettings({
  onExportBackup,
  onImportBackup,
  onRestoreDefaults,
  onResetSystem,
}: SystemSettingsProps) {
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
      }}
    >
      <Stack
        spacing={
          2.5
        }
      >
        <Stack
          direction={{
            xs:
              "column",

            sm:
              "row",
          }}
          spacing={
            1.5
          }
          alignItems={{
            xs:
              "flex-start",

            sm:
              "center",
          }}
          justifyContent="space-between"
        >
          <Stack
            direction="row"
            spacing={
              1.5
            }
            alignItems="center"
          >
            <SettingsBackupRestoreOutlined
              color="primary"
            />

            <Typography
              variant="h6"
              fontWeight={
                700
              }
            >
              {t(
                "system.title"
              )}
            </Typography>
          </Stack>

          <Chip
            label={t(
              "system.version"
            )}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {t(
            "system.description"
          )}
        </Typography>

        <Alert
          severity="info"
          icon={
            <InfoOutlined />
          }
        >
          {t(
            "system.info"
          )}
        </Alert>

        <Divider />

        <Stack
          direction={{
            xs:
              "column",

            md:
              "row",
          }}
          spacing={
            1.5
          }
          flexWrap="wrap"
          useFlexGap
        >
          <Button
            variant="outlined"
            startIcon={
              <BackupOutlined />
            }
            onClick={
              onExportBackup
            }
          >
            {t(
              "system.export"
            )}
          </Button>

          <Button
            variant="outlined"
            startIcon={
              <RestoreOutlined />
            }
            onClick={
              onImportBackup
            }
          >
            {t(
              "system.import"
            )}
          </Button>

          <Button
            variant="outlined"
            color="warning"
            startIcon={
              <SettingsBackupRestoreOutlined />
            }
            onClick={
              onRestoreDefaults
            }
          >
            {t(
              "system.restore"
            )}
          </Button>

          <Button
            variant="contained"
            color="error"
            startIcon={
              <DeleteForeverOutlined />
            }
            onClick={
              onResetSystem
            }
          >
            {t(
              "system.reset"
            )}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default SystemSettings;