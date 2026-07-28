import {
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  Clear,
  Search,
} from "@mui/icons-material";

import {
  ALL_CATEGORIES_VALUE,
  ALL_PRIORITIES_VALUE,
  ALL_STATUS_VALUE,
  ALL_TECHNICIANS_VALUE,
  UNASSIGNED_TECHNICIAN_VALUE,
} from "../../constants/ticketFilters";

import type {
  TicketCategoryFilter,
  TicketPriorityFilter,
  TicketStatusFilter,
  TicketTechnicianFilter,
} from "../../hooks/useTicketFilters";

import type {
  User,
} from "../../types/User";

interface TicketFiltersProps {
  searchTerm: string;

  statusFilter: TicketStatusFilter;

  priorityFilter: TicketPriorityFilter;

  categoryFilter: TicketCategoryFilter;

  technicianFilter: TicketTechnicianFilter;

  categories: string[];

  technicians: User[];

  filteredTicketsCount: number;

  hasActiveFilters: boolean;

  setSearchTerm: (value: string) => void;

  setStatusFilter: (
    value: TicketStatusFilter
  ) => void;

  setPriorityFilter: (
    value: TicketPriorityFilter
  ) => void;

  setCategoryFilter: (
    value: TicketCategoryFilter
  ) => void;

  setTechnicianFilter: (
    value: TicketTechnicianFilter
  ) => void;

  clearFilters: () => void;
}

export default function TicketFilters({
  searchTerm,
  statusFilter,
  priorityFilter,
  categoryFilter,
  technicianFilter,
  categories,
  technicians,
  filteredTicketsCount,
  hasActiveFilters,
  setSearchTerm,
  setStatusFilter,
  setPriorityFilter,
  setCategoryFilter,
  setTechnicianFilter,
  clearFilters,
}: TicketFiltersProps) {
  return (
    <Paper
      sx={{
        p: {
          xs: 2,
          md: 3,
        },
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Pesquisa e filtros
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Encontre chamados por texto,
            status, prioridade,
            categoria ou técnico.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              fullWidth
              label="Pesquisar chamados"
              placeholder="Título, descrição ou número"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              slotProps={{
                input: {
                  startAdornment: (
                    <Search
                      color="action"
                      sx={{ mr: 1 }}
                    />
                  ),
                },
              }}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <TextField
              select
              fullWidth
              label="Status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target
                    .value as TicketStatusFilter
                )
              }
            >
              <MenuItem value={ALL_STATUS_VALUE}>
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
              sm: 6,
              md: 3,
            }}
          >
            <TextField
              select
              fullWidth
              label="Prioridade"
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target
                    .value as TicketPriorityFilter
                )
              }
            >
              <MenuItem value={ALL_PRIORITIES_VALUE}>
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
              sm: 6,
              md: 4,
            }}
          >
            <TextField
              select
              fullWidth
              label="Categoria"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target
                    .value as TicketCategoryFilter
                )
              }
            >
              <MenuItem value={ALL_CATEGORIES_VALUE}>
                Todas
              </MenuItem>

              {categories.map((category) => (
                <MenuItem
                  key={category}
                  value={category}
                >
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 4,
            }}
          >
            <TextField
              select
              fullWidth
              label="Técnico"
              value={technicianFilter}
              onChange={(event) =>
                setTechnicianFilter(
                  event.target
                    .value as TicketTechnicianFilter
                )
              }
            >
              <MenuItem value={ALL_TECHNICIANS_VALUE}>
                Todos
              </MenuItem>

              <MenuItem value={UNASSIGNED_TECHNICIAN_VALUE}>
                Não atribuído
              </MenuItem>

              {technicians.map((technician) => (
                <MenuItem
                  key={technician.id}
                  value={String(technician.id)}
                >
                  {technician.name}
                  {technician.status === "Inativo"
                    ? " — Inativo"
                    : ""}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Clear />}
              sx={{
                height: "56px",
              }}
              disabled={!hasActiveFilters}
              onClick={clearFilters}
            >
              Limpar filtros
            </Button>
          </Grid>
        </Grid>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            sm: "center",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {filteredTicketsCount === 1
              ? "1 chamado encontrado"
              : `${filteredTicketsCount} chamados encontrados`}
          </Typography>

          {hasActiveFilters && (
            <Chip
              label="Filtros ativos"
              color="primary"
              variant="outlined"
              size="small"
            />
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}