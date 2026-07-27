import {
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { Search } from "@mui/icons-material";

interface TicketFiltersProps {
  searchTerm: string;
  statusFilter: string;
  priorityFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
}

export default function TicketFilters({
  searchTerm,
  statusFilter,
  priorityFilter,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
}: TicketFiltersProps) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
    >
      <TextField
        label="Pesquisar chamado"
        placeholder="Digite o título do chamado"
        value={searchTerm}
        onChange={(event) =>
          onSearchChange(event.target.value)
        }
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        select
        label="Status"
        value={statusFilter}
        onChange={(event) =>
          onStatusChange(event.target.value)
        }
        sx={{
          width: {
            xs: "100%",
            md: 220,
          },
        }}
      >
        <MenuItem value="Todos">Todos</MenuItem>
        <MenuItem value="Aberto">Aberto</MenuItem>
        <MenuItem value="Em andamento">
          Em andamento
        </MenuItem>
        <MenuItem value="Resolvido">
          Resolvido
        </MenuItem>
      </TextField>

      <TextField
        select
        label="Prioridade"
        value={priorityFilter}
        onChange={(event) =>
          onPriorityChange(event.target.value)
        }
        sx={{
          width: {
            xs: "100%",
            md: 220,
          },
        }}
      >
        <MenuItem value="Todas">Todas</MenuItem>
        <MenuItem value="Baixa">Baixa</MenuItem>
        <MenuItem value="Média">Média</MenuItem>
        <MenuItem value="Alta">Alta</MenuItem>
        <MenuItem value="Crítica">Crítica</MenuItem>
      </TextField>
    </Stack>
  );
}