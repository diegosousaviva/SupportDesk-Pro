import {
  ArrowBackOutlined,
  ClearOutlined,
  FilterAltOutlined,
  HistoryOutlined,
  SearchOutlined,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";
import PageHeader from "../../components/common/PageHeader";

import {
  getAuditLogs,
} from "../../services/auditLogService";

import type {
  AuditAction,
  AuditLog,
} from "../../types/AuditLog";

function formatDate(
  dateValue: string
): string {
  const date =
    new Date(
      dateValue
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle:
        "short",

      timeStyle:
        "medium",
    }
  ).format(
    date
  );
}

function getActionColor(
  action: AuditAction
):
  | "success"
  | "error"
  | "warning"
  | "info"
  | "primary"
  | "default" {
  switch (action) {
    case "Login":
      return "success";

    case "Logout":
      return "default";

    case "Criação":
      return "success";

    case "Edição":
      return "info";

    case "Exclusão":
      return "error";

    case "Alteração de status":
    case "Alteração de responsável":
      return "warning";

    case "Vinculação":
      return "primary";

    case "Desvinculação":
      return "warning";

    case "Upload":
      return "success";

    case "Download":
      return "info";

    case "Impressão":
      return "default";

    default:
      return "default";
  }
}

function getEntityLabel(
  log: AuditLog
): string {
  if (
    log.entityId ===
    null
  ) {
    return "—";
  }

  return `#${log.entityId}`;
}

function normalizeSearchValue(
  value: string
): string {
  return value
    .trim()
    .toLocaleLowerCase(
      "pt-BR"
    );
}

function getDateStart(
  dateValue: string
): Date | null {
  if (!dateValue) {
    return null;
  }

  const date =
    new Date(
      `${dateValue}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

function getDateEnd(
  dateValue: string
): Date | null {
  if (!dateValue) {
    return null;
  }

  const date =
    new Date(
      `${dateValue}T23:59:59.999`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

function AuditLogPage() {
  const navigate =
    useNavigate();

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    moduleFilter,
    setModuleFilter,
  ] = useState("");

  const [
    actionFilter,
    setActionFilter,
  ] = useState("");

  const [
    userFilter,
    setUserFilter,
  ] = useState("");

  const [
    startDate,
    setStartDate,
  ] = useState("");

  const [
    endDate,
    setEndDate,
  ] = useState("");

  const [
    page,
    setPage,
  ] = useState(0);

  const [
    rowsPerPage,
    setRowsPerPage,
  ] = useState(25);

  const auditLogs =
    getAuditLogs();

  const modules =
    useMemo(
      () =>
        Array.from(
          new Set(
            auditLogs.map(
              (log) =>
                log.module
            )
          )
        ).sort(
          (
            firstModule,
            secondModule
          ) =>
            firstModule.localeCompare(
              secondModule,
              "pt-BR"
            )
        ),
      [auditLogs]
    );

  const actions =
    useMemo(
      () =>
        Array.from(
          new Set(
            auditLogs.map(
              (log) =>
                log.action
            )
          )
        ).sort(
          (
            firstAction,
            secondAction
          ) =>
            firstAction.localeCompare(
              secondAction,
              "pt-BR"
            )
        ),
      [auditLogs]
    );

  const users =
    useMemo(
      () =>
        Array.from(
          new Set(
            auditLogs.map(
              (log) =>
                log.userName
            )
          )
        ).sort(
          (
            firstUser,
            secondUser
          ) =>
            firstUser.localeCompare(
              secondUser,
              "pt-BR"
            )
        ),
      [auditLogs]
    );

  const filteredAuditLogs =
    useMemo(
      () => {
        const normalizedSearch =
          normalizeSearchValue(
            search
          );

        const periodStart =
          getDateStart(
            startDate
          );

        const periodEnd =
          getDateEnd(
            endDate
          );

        return auditLogs.filter(
          (log) => {
            if (
              moduleFilter &&
              log.module !==
                moduleFilter
            ) {
              return false;
            }

            if (
              actionFilter &&
              log.action !==
                actionFilter
            ) {
              return false;
            }

            if (
              userFilter &&
              log.userName !==
                userFilter
            ) {
              return false;
            }

            const logDate =
              new Date(
                log.createdAt
              );

            if (
              !Number.isNaN(
                logDate.getTime()
              )
            ) {
              if (
                periodStart &&
                logDate <
                  periodStart
              ) {
                return false;
              }

              if (
                periodEnd &&
                logDate >
                  periodEnd
              ) {
                return false;
              }
            }

            if (
              !normalizedSearch
            ) {
              return true;
            }

            const searchableValues =
              [
                log.userName,
                log.module,
                log.action,
                log.description,
                log.details ??
                  "",
                log.entityId ===
                null
                  ? ""
                  : String(
                      log.entityId
                    ),
              ];

            return searchableValues.some(
              (value) =>
                normalizeSearchValue(
                  value
                ).includes(
                  normalizedSearch
                )
            );
          }
        );
      },
      [
        auditLogs,
        search,
        moduleFilter,
        actionFilter,
        userFilter,
        startDate,
        endDate,
      ]
    );

  const paginatedAuditLogs =
    useMemo(
      () => {
        const startIndex =
          page *
          rowsPerPage;

        const endIndex =
          startIndex +
          rowsPerPage;

        return filteredAuditLogs.slice(
          startIndex,
          endIndex
        );
      },
      [
        filteredAuditLogs,
        page,
        rowsPerPage,
      ]
    );

  const hasActiveFilters =
    search.trim() !== "" ||
    moduleFilter !== "" ||
    actionFilter !== "" ||
    userFilter !== "" ||
    startDate !== "" ||
    endDate !== "";

  function resetPage(): void {
    setPage(0);
  }

  function handleSearchChange(
    value: string
  ): void {
    setSearch(
      value
    );

    resetPage();
  }

  function handleModuleChange(
    value: string
  ): void {
    setModuleFilter(
      value
    );

    resetPage();
  }

  function handleActionChange(
    value: string
  ): void {
    setActionFilter(
      value
    );

    resetPage();
  }

  function handleUserChange(
    value: string
  ): void {
    setUserFilter(
      value
    );

    resetPage();
  }

  function handleStartDateChange(
    value: string
  ): void {
    setStartDate(
      value
    );

    resetPage();
  }

  function handleEndDateChange(
    value: string
  ): void {
    setEndDate(
      value
    );

    resetPage();
  }

  function handleClearFilters(): void {
    setSearch("");
    setModuleFilter("");
    setActionFilter("");
    setUserFilter("");
    setStartDate("");
    setEndDate("");
    setPage(0);
  }

  function handleChangePage(
    _event:
      unknown,
    newPage:
      number
  ): void {
    setPage(
      newPage
    );
  }

  function handleChangeRowsPerPage(
    event:
      React.ChangeEvent<HTMLInputElement>
  ): void {
    setRowsPerPage(
      Number(
        event.target.value
      )
    );

    setPage(0);
  }

  return (
    <MainLayout title="Auditoria">
      <Stack spacing={3}>
        <PageHeader
          title="Auditoria"
          subtitle="Consulte o histórico de ações administrativas e eventos importantes registrados pelo sistema."
        />

        <Stack
          direction={{
            xs:
              "column",
            sm:
              "row",
          }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{
            xs:
              "stretch",
            sm:
              "center",
          }}
        >
          <Button
            variant="outlined"
            startIcon={
              <ArrowBackOutlined />
            }
            onClick={() =>
              navigate(
                "/settings"
              )
            }
          >
            Voltar para configurações
          </Button>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
          >
            <Chip
              icon={
                <HistoryOutlined />
              }
              label={`${auditLogs.length} evento${
                auditLogs.length ===
                1
                  ? ""
                  : "s"
              } registrado${
                auditLogs.length ===
                1
                  ? ""
                  : "s"
              }`}
              color="primary"
              variant="outlined"
            />

            {hasActiveFilters && (
              <Chip
                icon={
                  <FilterAltOutlined />
                }
                label={`${filteredAuditLogs.length} resultado${
                  filteredAuditLogs.length ===
                  1
                    ? ""
                    : "s"
                }`}
                color="info"
              />
            )}
          </Stack>
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            p: {
              xs: 2,
              md: 3,
            },
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              mb: 0.5,
            }}
          >
            <FilterAltOutlined
              color="primary"
            />

            <Typography
              variant="h6"
              fontWeight={700}
            >
              Filtros
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2.5,
            }}
          >
            Refine os eventos de auditoria por texto, módulo, ação, usuário ou período.
          </Typography>

          <Stack
            spacing={2}
          >
            <TextField
              fullWidth
              label="Pesquisar"
              placeholder="Usuário, descrição, detalhes, módulo, ação ou número do registro..."
              value={search}
              onChange={(
                event
              ) =>
                handleSearchChange(
                  event.target.value
                )
              }
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Box
              sx={{
                display:
                  "grid",

                gridTemplateColumns: {
                  xs:
                    "1fr",

                  sm:
                    "repeat(2, minmax(0, 1fr))",

                  lg:
                    "repeat(5, minmax(0, 1fr))",
                },

                gap: 2,
              }}
            >
              <TextField
                select
                label="Módulo"
                value={
                  moduleFilter
                }
                onChange={(
                  event
                ) =>
                  handleModuleChange(
                    event.target.value
                  )
                }
              >
                <MenuItem value="">
                  Todos
                </MenuItem>

                {modules.map(
                  (module) => (
                    <MenuItem
                      key={
                        module
                      }
                      value={
                        module
                      }
                    >
                      {module}
                    </MenuItem>
                  )
                )}
              </TextField>

              <TextField
                select
                label="Ação"
                value={
                  actionFilter
                }
                onChange={(
                  event
                ) =>
                  handleActionChange(
                    event.target.value
                  )
                }
              >
                <MenuItem value="">
                  Todas
                </MenuItem>

                {actions.map(
                  (action) => (
                    <MenuItem
                      key={
                        action
                      }
                      value={
                        action
                      }
                    >
                      {action}
                    </MenuItem>
                  )
                )}
              </TextField>

              <TextField
                select
                label="Usuário"
                value={
                  userFilter
                }
                onChange={(
                  event
                ) =>
                  handleUserChange(
                    event.target.value
                  )
                }
              >
                <MenuItem value="">
                  Todos
                </MenuItem>

                {users.map(
                  (userName) => (
                    <MenuItem
                      key={
                        userName
                      }
                      value={
                        userName
                      }
                    >
                      {userName}
                    </MenuItem>
                  )
                )}
              </TextField>

              <TextField
                type="date"
                label="Data inicial"
                value={
                  startDate
                }
                onChange={(
                  event
                ) =>
                  handleStartDateChange(
                    event.target.value
                  )
                }
                slotProps={{
                  inputLabel: {
                    shrink:
                      true,
                  },
                }}
              />

              <TextField
                type="date"
                label="Data final"
                value={
                  endDate
                }
                onChange={(
                  event
                ) =>
                  handleEndDateChange(
                    event.target.value
                  )
                }
                slotProps={{
                  inputLabel: {
                    shrink:
                      true,
                  },
                }}
              />
            </Box>

            <Stack
              direction={{
                xs:
                  "column",
                sm:
                  "row",
              }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{
                xs:
                  "stretch",
                sm:
                  "center",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Exibindo{" "}
                <strong>
                  {
                    filteredAuditLogs.length
                  }
                </strong>{" "}
                de{" "}
                <strong>
                  {
                    auditLogs.length
                  }
                </strong>{" "}
                eventos.
              </Typography>

              <Button
                variant="text"
                startIcon={
                  <ClearOutlined />
                }
                disabled={
                  !hasActiveFilters
                }
                onClick={
                  handleClearFilters
                }
              >
                Limpar filtros
              </Button>
            </Stack>
          </Stack>
        </Paper>

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
              <HistoryOutlined
                color="primary"
              />

              <Typography
                variant="h6"
                fontWeight={700}
              >
                Histórico de auditoria
              </Typography>
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              Os eventos mais recentes aparecem primeiro.
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
                  1100,
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    Data / hora
                  </TableCell>

                  <TableCell>
                    Usuário
                  </TableCell>

                  <TableCell>
                    Módulo
                  </TableCell>

                  <TableCell>
                    Ação
                  </TableCell>

                  <TableCell>
                    Registro
                  </TableCell>

                  <TableCell>
                    Descrição
                  </TableCell>

                  <TableCell>
                    Detalhes
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedAuditLogs.length ===
                0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                    >
                      <Stack
                        spacing={1}
                        alignItems="center"
                        sx={{
                          py: 6,
                        }}
                      >
                        <HistoryOutlined
                          sx={{
                            fontSize:
                              48,

                            color:
                              "text.disabled",
                          }}
                        />

                        <Typography
                          fontWeight={700}
                        >
                          {auditLogs.length ===
                          0
                            ? "Nenhum evento registrado"
                            : "Nenhum evento encontrado"}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {auditLogs.length ===
                          0
                            ? "Os eventos de auditoria aparecerão aqui conforme as ações forem realizadas no sistema."
                            : "Altere ou limpe os filtros para visualizar outros eventos."}
                        </Typography>

                        {auditLogs.length >
                          0 &&
                          hasActiveFilters && (
                            <Button
                              variant="outlined"
                              startIcon={
                                <ClearOutlined />
                              }
                              onClick={
                                handleClearFilters
                              }
                              sx={{
                                mt: 1,
                              }}
                            >
                              Limpar filtros
                            </Button>
                          )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedAuditLogs.map(
                    (log) => (
                      <TableRow
                        key={
                          log.id
                        }
                        hover
                      >
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {formatDate(
                              log.createdAt
                            )}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Stack
                            spacing={0.25}
                          >
                            <Typography
                              fontWeight={600}
                            >
                              {
                                log.userName
                              }
                            </Typography>

                            {log.userId !==
                              null && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Usuário #
                                {
                                  log.userId
                                }
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={
                              log.module
                            }
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={
                              log.action
                            }
                            size="small"
                            color={getActionColor(
                              log.action
                            )}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography
                            fontWeight={600}
                          >
                            {getEntityLabel(
                              log
                            )}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              minWidth:
                                220,

                              overflowWrap:
                                "anywhere",
                            }}
                          >
                            {
                              log.description
                            }
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              minWidth:
                                180,

                              overflowWrap:
                                "anywhere",
                            }}
                          >
                            {log.details ||
                              "—"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredAuditLogs.length >
            0 && (
            <TablePagination
              component="div"
              count={
                filteredAuditLogs.length
              }
              page={
                page
              }
              onPageChange={
                handleChangePage
              }
              rowsPerPage={
                rowsPerPage
              }
              onRowsPerPageChange={
                handleChangeRowsPerPage
              }
              rowsPerPageOptions={[
                10,
                25,
                50,
                100,
              ]}
              labelRowsPerPage="Eventos por página:"
              labelDisplayedRows={({
                from,
                to,
                count,
              }) =>
                `${from}–${to} de ${count}`
              }
            />
          )}
        </Paper>
      </Stack>
    </MainLayout>
  );
}

export default AuditLogPage;