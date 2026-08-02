import {
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export interface ReportFiltersData {
  period: string;
  status: string;
  priority: string;
  technician: string;
  category: string;
  search: string;
}

interface ReportFiltersProps {
  filters: ReportFiltersData;
  onChange: (
    field: keyof ReportFiltersData,
    value: string
  ) => void;
  onClear: () => void;
}

function ReportFilters({
  filters,
  onChange,
  onClear,
}: ReportFiltersProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
      }}
    >
      <Stack spacing={3}>
        <Typography
          variant="h6"
          fontWeight={700}
        >
          Filtros
        </Typography>

        <Grid
          container
          spacing={2}
        >
          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <TextField
              select
              fullWidth
              label="Período"
              value={filters.period}
              onChange={(event) =>
                onChange(
                  "period",
                  event.target.value
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

              <MenuItem value="month">
                Este mês
              </MenuItem>

              <MenuItem value="year">
                Este ano
              </MenuItem>
            </TextField>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <TextField
              select
              fullWidth
              label="Status"
              value={filters.status}
              onChange={(event) =>
                onChange(
                  "status",
                  event.target.value
                )
              }
            >
              <MenuItem value="">
                Todos
              </MenuItem>

              <MenuItem value="Aberto">
                Aberto
              </MenuItem>

              <MenuItem value="Em andamento">
                Em andamento
              </MenuItem>

              <MenuItem value="Resolvido">
                Resolvido
              </MenuItem>
            </TextField>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <TextField
              select
              fullWidth
              label="Prioridade"
              value={filters.priority}
              onChange={(event) =>
                onChange(
                  "priority",
                  event.target.value
                )
              }
            >
              <MenuItem value="">
                Todas
              </MenuItem>

              <MenuItem value="Baixa">
                Baixa
              </MenuItem>

              <MenuItem value="Média">
                Média
              </MenuItem>

              <MenuItem value="Alta">
                Alta
              </MenuItem>

              <MenuItem value="Crítica">
                Crítica
              </MenuItem>
            </TextField>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <TextField
              fullWidth
              label="Técnico"
              value={filters.technician}
              onChange={(event) =>
                onChange(
                  "technician",
                  event.target.value
                )
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <TextField
              fullWidth
              label="Categoria"
              value={filters.category}
              onChange={(event) =>
                onChange(
                  "category",
                  event.target.value
                )
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <TextField
              fullWidth
              label="Pesquisar"
              placeholder="Título do chamado..."
              value={filters.search}
              onChange={(event) =>
                onChange(
                  "search",
                  event.target.value
                )
              }
            />
          </Grid>
        </Grid>

        <Stack
          direction="row"
          justifyContent="flex-end"
        >
          <Button
            variant="outlined"
            onClick={onClear}
          >
            Limpar filtros
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default ReportFilters;