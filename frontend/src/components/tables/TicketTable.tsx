import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import type { Ticket } from "../../types/Ticket";

interface TicketTableProps {
  tickets: Ticket[];
}

export default function TicketTable({
  tickets,
}: TicketTableProps) {
  const navigate = useNavigate();

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>ID</strong>
            </TableCell>

            <TableCell>
              <strong>Título</strong>
            </TableCell>

            <TableCell>
              <strong>Categoria</strong>
            </TableCell>

            <TableCell>
              <strong>Prioridade</strong>
            </TableCell>

            <TableCell>
              <strong>Status</strong>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {tickets.map((ticket) => (
            <TableRow
              key={ticket.id}
              hover
              sx={{ cursor: "pointer" }}
              onClick={() =>
                navigate(`/tickets/${ticket.id}`)
              }
            >
              <TableCell>#{ticket.id}</TableCell>

              <TableCell>{ticket.title}</TableCell>

              <TableCell>{ticket.category}</TableCell>

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
            </TableRow>
          ))}

          {tickets.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                Nenhum chamado encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}