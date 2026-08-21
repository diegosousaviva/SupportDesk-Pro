import {
  BusinessOutlined,
} from "@mui/icons-material";

import {
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  useLanguage,
} from "../../contexts/LanguageContext";

export interface CompanySettingsData {
  companyName: string;
  supportEmail: string;
  supportPhone: string;
  website: string;
}

interface CompanySettingsProps {
  settings: CompanySettingsData;

  onChange: (
    field:
      keyof CompanySettingsData,
    value:
      string
  ) => void;
}

function CompanySettings({
  settings,
  onChange,
}: CompanySettingsProps) {
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
          <BusinessOutlined
            color="primary"
          />

          <Typography
            variant="h6"
            fontWeight={
              700
            }
          >
            {t(
              "company.title"
            )}
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {t(
            "company.description"
          )}
        </Typography>

        <TextField
          label={t(
            "company.name"
          )}
          fullWidth
          value={
            settings.companyName
          }
          onChange={(
            event
          ) =>
            onChange(
              "companyName",
              event.target.value
            )
          }
        />

        <TextField
          label={t(
            "company.supportEmail"
          )}
          type="email"
          fullWidth
          value={
            settings.supportEmail
          }
          onChange={(
            event
          ) =>
            onChange(
              "supportEmail",
              event.target.value
            )
          }
        />

        <TextField
          label={t(
            "company.supportPhone"
          )}
          fullWidth
          value={
            settings.supportPhone
          }
          onChange={(
            event
          ) =>
            onChange(
              "supportPhone",
              event.target.value
            )
          }
        />

        <TextField
          label={t(
            "company.website"
          )}
          type="url"
          fullWidth
          placeholder={t(
            "company.websitePlaceholder"
          )}
          value={
            settings.website
          }
          onChange={(
            event
          ) =>
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