import {
  BusinessOutlined,
} from "@mui/icons-material";

import {
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export interface CompanySettingsData {
  companyName: string;
  supportEmail: string;
  supportPhone: string;
  website: string;
}

interface CompanySettingsProps {
  settings: CompanySettingsData;
  onChange: (
    field: keyof CompanySettingsData,
    value: string
  ) => void;
}

function CompanySettings({
  settings,
  onChange,
}: CompanySettingsProps) {
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
          <BusinessOutlined
            color="primary"
          />

          <Typography
            variant="h6"
            fontWeight={700}
          >
            Dados da empresa
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Informações institucionais utilizadas no
          sistema e nos relatórios.
        </Typography>

        <TextField
          label="Nome da empresa"
          fullWidth
          value={settings.companyName}
          onChange={(event) =>
            onChange(
              "companyName",
              event.target.value
            )
          }
        />

        <TextField
          label="E-mail de suporte"
          type="email"
          fullWidth
          value={settings.supportEmail}
          onChange={(event) =>
            onChange(
              "supportEmail",
              event.target.value
            )
          }
        />

        <TextField
          label="Telefone de suporte"
          fullWidth
          value={settings.supportPhone}
          onChange={(event) =>
            onChange(
              "supportPhone",
              event.target.value
            )
          }
        />

        <TextField
          label="Site da empresa"
          type="url"
          fullWidth
          placeholder="https://www.exemplo.com.br"
          value={settings.website}
          onChange={(event) =>
            onChange(
              "website",
              event.target.value
            )
          }
        />
      </Stack>
    </Paper>
  );
}

export default CompanySettings;