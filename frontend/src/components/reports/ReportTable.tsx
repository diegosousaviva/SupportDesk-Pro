import {
  VisibilityOutlined,
} from "@mui/icons-material";

import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import type {
  Ticket,
  TicketPriority,
  TicketStatus,
} from "../../types/Ticket";

import type {
  User,
} from "../../types/User";

interface ReportTableProps {
  tickets: Ticket[];
  users: User[];
  onView?: (ticketId: number) => void;
}

function getPriorityColor(
  priority: TicketPriority
):
  | "error"
  | "warning"
  | "info"
  | "success"
  | "default" {
  switch (priority) {
    case "Crítica":
      return "error";

    case "Alta":
      return "warning";

    case "Média":
      return "info";

    case "Baixa":
      return "success";

    default:
      return "default";
  }
}

function getStatusColor(
  status: TicketStatus
):
  | "warning"
  | "info"
  | "success"
  | "default" {
  switch (status) {
    case "Aberto":
      return "warning";

    case "Em andamento":
      return "info";

    case "Resolvido":
      return "success";

    default:
      return "default";
  }
}

function formatDate(
  dateValue: string
): string {
  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Data não disponível";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(date);
}

function getTechnicianName(
  technicianId: number | null,
  users: User[]
): string {
  if (
    technicianId === null
  ) {
    return "Não atribuído";
  }

  const technician =
    users.find(
      (user) =>
        user.id ===
        technicianId
    );

  if (!technician) {
    return `Técnico não encontrado (#${technicianId})`;
  }

  return technician.name;
}

function ReportTable({
  tickets,
  users,
  onView,
}: ReportTableProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: {
            xs: 2,
            md: 3,
          },
          py: 2.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
        >
          Resultados
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          {tickets.length === 0
            ? "Nenhum chamado encontrado com os filtros informados."
            : `${tickets.length} chamado${
                tickets.length === 1
                  ? ""
                  : "s"
              } encontrado${
                tickets.length === 1
                  ? ""
                  : "s"
              }.`}
        </Typography>
      </Box>

      <TableContainer
        sx={{
          maxWidth: "100%",
          overflowX: "auto",
        }}
      >
        <Table
          sx={{
            minWidth: 1050,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>
                ID
              </TableCell>

              <TableCell>
                Chamado
              </TableCell>

              <TableCell>
                Categoria
              </TableCell>

              <TableCell>
                Prioridade
              </TableCell>

              <TableCell>
                Status
              </TableCell>

              <TableCell>
                Técnico
              </TableCell>

              <TableCell>
                Criado em
              </TableCell>

              {onView && (
                <TableCell
                  align="center"
                >
                  Ações
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    onView
                      ? 8
                      : 7
                  }
                  align="center"
                >
                  <Stack
                    spacing={0.5}
                    alignItems="center"
                    sx={{
                      py: 5,
                    }}
                  >
                    <Typography
                      fontWeight={700}
                    >
                      Nenhum resultado encontrado
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Altere ou limpe os filtros para visualizar outros chamados.
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              tickets.map(
                (ticket) => (
                  <TableRow
                    key={ticket.id}
                    hover
                  >
                    <TableCell>
                      <Typography
                        color="primary.main"
                        fontWeight={700}
                      >
                        #{ticket.id}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box
                        sx={{
                          maxWidth: 300,
                        }}
                      >
                        <Typography
                          fontWeight={600}
                          sx={{
                            overflowWrap:
                              "anywhere",
                          }}
                        >
                          {ticket.title}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            mt: 0.25,
                            overflow: "hidden",
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {ticket.description}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      {ticket.category}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={
                          ticket.priority
                        }
                        color={getPriorityColor(
                          ticket.priority
                        )}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={
                          ticket.status
                        }
                        color={getStatusColor(
                          ticket.status
                        )}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      {getTechnicianName(
                        ticket.assignedTechnicianId,
                        users
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {formatDate(
                          ticket.createdAt
                        )}
                      </Typography>
                    </TableCell>

                    {onView && (
                      <TableCell
                        align="center"
                      >
                        <Tooltip title="Visualizar chamado">
                          <IconButton
                            color="primary"
                            aria-label={`Visualizar chamado ${ticket.id}`}
                            onClick={() =>
                              onView(
                                ticket.id
                              )
                            }
                          >
                            <VisibilityOutlined />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default ReportTable;