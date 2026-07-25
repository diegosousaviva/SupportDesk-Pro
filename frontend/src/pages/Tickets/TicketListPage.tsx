import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { getTickets } from "../../services/ticketService";

import MainLayout from "../../components/layout/MainLayout";

function TicketListPage() {
  const navigate = useNavigate();
  const tickets = getTickets();

  return (
    <MainLayout title="Chamados">
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4">Lista de chamados</Typography>

          <Typography color="text.secondary">
            Consulte e acompanhe os chamados registrados.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/tickets/new")}
        >
          Novo chamado
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Número</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Prioridade</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id} hover>
                <TableCell>#{ticket.id}</TableCell>
                <TableCell>{ticket.title}</TableCell>
                <TableCell>{ticket.category}</TableCell>

                <TableCell>
                  <Chip
                    label={ticket.priority}
                    color={
                      ticket.priority === "Alta"
                        ? "error"
                        : ticket.priority === "Média"
                          ? "warning"
                          : "success"
                    }
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label={ticket.status}
                    color={
                      ticket.status === "Aberto"
                        ? "error"
                        : ticket.status === "Em andamento"
                          ? "warning"
                          : "success"
                    }
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </MainLayout>
  );
}

export default TicketListPage;