import {
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";

import type { Ticket } from "../../types/Ticket";

export type TicketSortDirection = "asc" | "desc";

export type TicketSortField =
  | "id"
  | "title"
  | "category"
  | "technician"
  | "priority"
  | "status";

interface TicketTableProps {
  tickets: Ticket[];
  sortField: TicketSortField;
  sortDirection: TicketSortDirection;
  getTechnicianName: (
    technicianId: number | null
  ) => string;
  onSort: (field: TicketSortField) => void;
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onAssign?: (id: number) => void;
  onClose?: (id: number) => void;
  onDelete?: (id: number) => void;
}

function TicketTable({
  tickets,
  sortField,
  sortDirection,
  getTechnicianName,
  onSort,
  onView,
  onEdit,
  onAssign,
  onClose,
  onDelete,
}: TicketTableProps) {
  const hasActions = Boolean(
    onView ||
      onEdit ||
      onAssign ||
      onClose ||
      onDelete
  );

  function getSortDirection(
    field: TicketSortField
  ): TicketSortDirection | false {
    return sortField === field
      ? sortDirection
      : false;
  }

  function getTableSortDirection(
    field: TicketSortField
  ): TicketSortDirection {
    return sortField === field
      ? sortDirection
      : "asc";
  }

  return (
    <TableContainer>
      <Table sx={{ minWidth: hasActions ? 980 : 850 }}>
        <TableHead>
          <TableRow>
            <TableCell
              sortDirection={getSortDirection("id")}
            >
              <TableSortLabel
                active={sortField === "id"}
                direction={getTableSortDirection("id")}
                onClick={() => onSort("id")}
              >
                <strong>ID</strong>
              </TableSortLabel>
            </TableCell>

            <TableCell
              sortDirection={getSortDirection("title")}
            >
              <TableSortLabel
                active={sortField === "title"}
                direction={getTableSortDirection("title")}
                onClick={() => onSort("title")}
              >
                <strong>Título</strong>
              </TableSortLabel>
            </TableCell>

            <TableCell
              sortDirection={getSortDirection(
                "category"
              )}
            >
              <TableSortLabel
                active={sortField === "category"}
                direction={getTableSortDirection(
                  "category"
                )}
                onClick={() => onSort("category")}
              >
                <strong>Categoria</strong>
              </TableSortLabel>
            </TableCell>

            <TableCell
              sortDirection={getSortDirection(
                "technician"
              )}
            >
              <TableSortLabel
                active={sortField === "technician"}
                direction={getTableSortDirection(
                  "technician"
                )}
                onClick={() => onSort("technician")}
              >
                <strong>Técnico</strong>
              </TableSortLabel>
            </TableCell>

            <TableCell
              sortDirection={getSortDirection(
                "priority"
              )}
            >
              <TableSortLabel
                active={sortField === "priority"}
                direction={getTableSortDirection(
                  "priority"
                )}
                onClick={() => onSort("priority")}
              >
                <strong>Prioridade</strong>
              </TableSortLabel>
            </TableCell>

            <TableCell
              sortDirection={getSortDirection("status")}
            >
              <TableSortLabel
                active={sortField === "status"}
                direction={getTableSortDirection(
                  "status"
                )}
                onClick={() => onSort("status")}
              >
                <strong>Status</strong>
              </TableSortLabel>
            </TableCell>

            {hasActions && (
              <TableCell align="center">
                <strong>Ações</strong>
              </TableCell>
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {tickets.map((ticket) => (
            <TableRow
              key={ticket.id}
              hover
            >
              <TableCell>
                #{ticket.id}
              </TableCell>

              <TableCell>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600 }}
                >
                  {ticket.title}
                </Typography>
              </TableCell>

              <TableCell>
                {ticket.category}
              </TableCell>

              <TableCell>
                <Typography
                  variant="body2"
                  color={
                    ticket.assignedTechnicianId === null
                      ? "text.secondary"
                      : "text.primary"
                  }
                >
                  {getTechnicianName(
                    ticket.assignedTechnicianId
                  )}
                </Typography>
              </TableCell>

              <TableCell>
                <Chip
                  label={ticket.priority}
                  size="small"
                  color={
                    ticket.priority === "Crítica" ||
                    ticket.priority === "Alta"
                      ? "error"
                      : ticket.priority === "Média"
                        ? "warning"
                        : "success"
                  }
                />
              </TableCell>

              <TableCell>
                <Chip
                  label={ticket.status}
                  size="small"
                  color={
                    ticket.status === "Aberto"
                      ? "warning"
                      : ticket.status === "Em andamento"
                        ? "info"
                        : "success"
                  }
                />
              </TableCell>

              {hasActions && (
                <TableCell align="center">
                  {onView && (
                    <Tooltip title="Visualizar">
                      <IconButton
                        color="primary"
                        aria-label={`Visualizar chamado ${ticket.id}`}
                        onClick={() => onView(ticket.id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {onEdit && (
                    <Tooltip title="Editar">
                      <IconButton
                        color="warning"
                        aria-label={`Editar chamado ${ticket.id}`}
                        onClick={() => onEdit(ticket.id)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {onAssign && (
                    <Tooltip title="Atribuir técnico">
                      <IconButton
                        color="info"
                        aria-label={`Atribuir técnico ao chamado ${ticket.id}`}
                        onClick={() => onAssign(ticket.id)}
                      >
                        <PersonAddIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {onClose && (
                    <Tooltip title="Encerrar chamado">
                      <IconButton
                        color="success"
                        aria-label={`Encerrar chamado ${ticket.id}`}
                        onClick={() => onClose(ticket.id)}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {onDelete && (
                    <Tooltip title="Excluir">
                      <IconButton
                        color="error"
                        aria-label={`Excluir chamado ${ticket.id}`}
                        onClick={() => onDelete(ticket.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}

          {tickets.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={hasActions ? 7 : 6}
                align="center"
                sx={{ py: 6 }}
              >
                <Stack
                  spacing={1.5}
                  alignItems="center"
                >
                  <SearchIcon
                    color="disabled"
                    sx={{ fontSize: 42 }}
                  />

                  <Typography sx={{ fontWeight: 600 }}>
                    Nenhum chamado encontrado
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Altere os termos da pesquisa ou limpe os
                    filtros selecionados.
                  </Typography>
                </Stack>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default TicketTable;