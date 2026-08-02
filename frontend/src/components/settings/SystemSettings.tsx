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

interface SystemSettingsProps {
  onExportBackup: () => void;
  onImportBackup: () => void;
  onRestoreDefaults: () => void;
  onResetSystem: () => void;
}

function SystemSettings({
  onExportBackup,
  onImportBackup,
  onRestoreDefaults,
  onResetSystem,
}: SystemSettingsProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: {
          xs: 2.5,
          md: 3,
        },
      }}
    >
      <Stack spacing={2.5}>
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1.5}
          alignItems={{
            xs: "flex-start",
            sm: "center",
          }}
          justifyContent="space-between"
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <SettingsBackupRestoreOutlined
              color="primary"
            />

            <Typography
              variant="h6"
              fontWeight={700}
            >
              Sistema
            </Typography>
          </Stack>

          <Chip
            label="Versão 1.0.0"
            color="primary"
            variant="outlined"
            size="small"
          />
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Faça backup, restaure preferências ou redefina
          os dados locais do sistema.
        </Typography>

        <Alert
          severity="info"
          icon={<InfoOutlined />}
        >
          Nesta versão, os dados são armazenados no
          navegador. O backup completo com banco de dados
          será implementado na fase de backend.
        </Alert>

        <Divider />

        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={1.5}
          flexWrap="wrap"
          useFlexGap
        >
          <Button
            variant="outlined"
            startIcon={
              <BackupOutlined />
            }
            onClick={onExportBackup}
          >
            Exportar configurações
          </Button>

          <Button
            variant="outlined"
            startIcon={
              <RestoreOutlined />
            }
            onClick={onImportBackup}
          >
            Importar configurações
          </Button>

          <Button
            variant="outlined"
            color="warning"
            startIcon={
              <SettingsBackupRestoreOutlined />
            }
            onClick={onRestoreDefaults}
          >
            Restaurar padrões
          </Button>

          <Button
            variant="contained"
            color="error"
            startIcon={
              <DeleteForeverOutlined />
            }
            onClick={onResetSystem}
          >
            Resetar dados locais
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default SystemSettings;