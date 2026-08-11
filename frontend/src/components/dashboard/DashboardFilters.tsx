import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import {
  ClearOutlined,
} from "@mui/icons-material";

import type {
  Store,
} from "../../types/Store";

export type DashboardPeriod =
  | "today"
  | "7_days"
  | "30_days"
  | "90_days"
  | "this_month"
  | "this_year";

export type DashboardStoreFilter =
  | "all"
  | string;

interface DashboardFiltersProps {
  period:
    DashboardPeriod;

  storeFilter:
    DashboardStoreFilter;

  stores:
    Store[];

  showStoreFilter?:
    boolean;

  onPeriodChange: (
    period: DashboardPeriod
  ) => void;

  onStoreFilterChange: (
    storeFilter:
      DashboardStoreFilter
  ) => void;

  onClearFilters:
    () => void;
}

export default function DashboardFilters({
  period,
  storeFilter,
  stores,
  showStoreFilter = true,
  onPeriodChange,
  onStoreFilterChange,
  onClearFilters,
}: DashboardFiltersProps) {
  const hasActiveFilters =
    period !==
      "30_days" ||
    (
      showStoreFilter &&
      storeFilter !==
        "all"
    );

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
      <Stack spacing={2}>
        <Box>
          <Typography
            variant="subtitle1"
            fontWeight={700}
          >
            Filtros do Dashboard
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            {showStoreFilter
              ? "Selecione o período e a loja utilizados nos indicadores e gráficos."
              : "Selecione o período utilizado nos indicadores e gráficos."}
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={2}
          alignItems={{
            xs: "stretch",
            md: "center",
          }}
        >
          <FormControl
            size="small"
            sx={{
              minWidth: {
                xs: "100%",
                md: 220,
              },
            }}
          >
            <InputLabel id="dashboard-period-label">
              Período
            </InputLabel>

            <Select
              labelId="dashboard-period-label"
              value={
                period
              }
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

          {showStoreFilter && (
            <FormControl
              size="small"
              sx={{
                minWidth: {
                  xs: "100%",
                  md: 260,
                },
              }}
            >
              <InputLabel id="dashboard-store-label">
                Loja
              </InputLabel>

              <Select
                labelId="dashboard-store-label"
                value={
                  storeFilter
                }
                label="Loja"
                onChange={(event) =>
                  onStoreFilterChange(
                    String(
                      event.target.value
                    )
                  )
                }
              >
                <MenuItem value="all">
                  Todas as lojas
                </MenuItem>

                {stores.map(
                  (store) => (
                    <MenuItem
                      key={
                        store.id
                      }
                      value={
                        String(
                          store.id
                        )
                      }
                    >
                      {store.code} —{" "}
                      {store.name}
                      {store.status ===
                      "Inativa"
                        ? " — Inativa"
                        : ""}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          )}

          {hasActiveFilters && (
            <Button
              variant="text"
              startIcon={
                <ClearOutlined />
              }
              onClick={
                onClearFilters
              }
              sx={{
                alignSelf: {
                  xs: "flex-start",
                  md: "center",
                },
              }}
            >
              Limpar filtros
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}