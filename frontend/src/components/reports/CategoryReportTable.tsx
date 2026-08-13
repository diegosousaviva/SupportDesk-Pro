import {
  CategoryOutlined,
} from "@mui/icons-material";

import {
  Box,
  Chip,
  LinearProgress,
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

import type {
  CategoryReportItem,
} from "../../services/categoryReportService";

interface CategoryReportTableProps {
  items:
    CategoryReportItem[];
}

function getResolutionColor(
  value: number
):
  | "success"
  | "warning"
  | "error" {
  if (value >= 80) {
    return "success";
  }

  if (value >= 50) {
    return "warning";
  }

  return "error";
}

function getSlaColor(
  value: number
):
  | "success"
  | "warning"
  | "error" {
  if (value >= 90) {
    return "success";
  }

  if (value >= 70) {
    return "warning";
  }

  return "error";
}

function CategoryReportTable({
  items,
}: CategoryReportTableProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        overflow:
          "hidden",
      }}
    >
      <Box
        sx={{
          px: {
            xs: 2,
            md: 3,
          },

          py: 2.5,

          borderBottom:
            "1px solid",

          borderColor:
            "divider",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <CategoryOutlined
            color="primary"
          />

          <Typography
            variant="h6"
            fontWeight={700}
          >
            Relatório por categoria
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
          }}
        >
          Compare volume de chamados, resolução e cumprimento de SLA por categoria.
        </Typography>
      </Box>

      <TableContainer
        sx={{
          maxWidth:
            "100%",

          overflowX:
            "auto",
        }}
      >
        <Table
          sx={{
            minWidth:
              1050,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>
                Categoria
              </TableCell>

              <TableCell
                align="center"
              >
                Total
              </TableCell>

              <TableCell
                align="center"
              >
                Abertos
              </TableCell>

              <TableCell
                align="center"
              >
                Em andamento
              </TableCell>

              <TableCell
                align="center"
              >
                Resolvidos
              </TableCell>

              <TableCell
                align="center"
              >
                Críticos
              </TableCell>

              <TableCell>
                Taxa de resolução
              </TableCell>

              <TableCell>
                SLA
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {items.length ===
            0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  align="center"
                >
                  <Stack
                    spacing={1}
                    alignItems="center"
                    sx={{
                      py: 5,
                    }}
                  >
                    <CategoryOutlined
                      sx={{
                        fontSize:
                          42,

                        color:
                          "text.disabled",
                      }}
                    />

                    <Typography
                      fontWeight={700}
                    >
                      Nenhuma categoria encontrada
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Não existem chamados dentro dos filtros selecionados.
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              items.map(
                (item) => (
                  <TableRow
                    key={
                      item.category
                    }
                    hover
                  >
                    <TableCell>
                      <Typography
                        fontWeight={700}
                      >
                        {
                          item.category
                        }
                      </Typography>
                    </TableCell>

                    <TableCell
                      align="center"
                    >
                      {
                        item.totalTickets
                      }
                    </TableCell>

                    <TableCell
                      align="center"
                    >
                      <Chip
                        label={
                          item.openTickets
                        }
                        size="small"
                        color={
                          item.openTickets >
                          0
                            ? "warning"
                            : "default"
                        }
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell
                      align="center"
                    >
                      <Chip
                        label={
                          item.inProgressTickets
                        }
                        size="small"
                        color={
                          item.inProgressTickets >
                          0
                            ? "info"
                            : "default"
                        }
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell
                      align="center"
                    >
                      <Chip
                        label={
                          item.resolvedTickets
                        }
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell
                      align="center"
                    >
                      <Chip
                        label={
                          item.criticalTickets
                        }
                        size="small"
                        color={
                          item.criticalTickets >
                          0
                            ? "error"
                            : "default"
                        }
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Stack
                        spacing={0.75}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          spacing={2}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={700}
                          >
                            {
                              item.resolutionRate
                            }
                            %
                          </Typography>

                          <Chip
                            label={`${item.resolutionRate}%`}
                            size="small"
                            color={getResolutionColor(
                              item.resolutionRate
                            )}
                          />
                        </Stack>

                        <LinearProgress
                          variant="determinate"
                          value={
                            item.resolutionRate
                          }
                          sx={{
                            height:
                              7,

                            borderRadius:
                              999,
                          }}
                        />
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack
                        spacing={0.75}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          spacing={2}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={700}
                          >
                            {
                              item.slaCompliance
                            }
                            %
                          </Typography>

                          <Chip
                            label={`${item.slaCompliance}%`}
                            size="small"
                            color={getSlaColor(
                              item.slaCompliance
                            )}
                          />
                        </Stack>

                        <LinearProgress
                          variant="determinate"
                          value={
                            item.slaCompliance
                          }
                          sx={{
                            height:
                              7,

                            borderRadius:
                              999,
                          }}
                        />
                      </Stack>
                    </TableCell>
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

export default CategoryReportTable;