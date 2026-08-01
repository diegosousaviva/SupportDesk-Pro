import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";

export type DashboardPeriod =
  | "today"
  | "7_days"
  | "30_days"
  | "90_days"
  | "this_month"
  | "this_year";

interface DashboardFiltersProps {
  period: DashboardPeriod;
  onPeriodChange: (
    period: DashboardPeriod
  ) => void;
}

export default function DashboardFilters({
  period,
  onPeriodChange,
}: DashboardFiltersProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: {
          xs: 2,
          md: 2.5,
        },
      }}
    >
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        alignItems={{
          xs: "stretch",
          sm: "center",
        }}
        justifyContent="space-between"
      >
        <Box>
          <Typography
            variant="subtitle1"
            fontWeight={700}
          >
            Período de análise
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Selecione o período utilizado nos
            indicadores e gráficos do Dashboard.
          </Typography>
        </Box>

        <FormControl
          size="small"
          sx={{
            minWidth: {
              xs: "100%",
              sm: 220,
            },
          }}
        >
          <InputLabel id="dashboard-period-label">
            Período
          </InputLabel>

          <Select
            labelId="dashboard-period-label"
            value={period}
            label="Período"
            onChange={(event) =>
              onPeriodChange(
                event.target
                  .value as DashboardPeriod
              )
            }
          >
            <MenuItem value="today">
              Hoje
            </MenuItem>

            <MenuItem value="7_days">
              Últimos 7 dias
            </MenuItem>

            <MenuItem value="30_days">
              Últimos 30 dias
            </MenuItem>

            <MenuItem value="90_days">
              Últimos 90 dias
            </MenuItem>

            <MenuItem value="this_month">
              Este mês
            </MenuItem>

            <MenuItem value="this_year">
              Este ano
            </MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Paper>
  );
}