import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ChangeEvent,
  MouseEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import GridOnOutlinedIcon from "@mui/icons-material/GridOnOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";

import {
  Permissions,
} from "../../auth/permissions";

import DataTablePagination from "../../components/common/DataTablePagination";
import DataTableToolbar from "../../components/common/DataTableToolbar";
import EmptyState from "../../components/common/EmptyState";
import PageCard from "../../components/common/PageCard";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import StatCard from "../../components/dashboard/StatCard";
import MainLayout from "../../components/layout/MainLayout";
import UserTable from "../../components/tables/UserTable";
import UserAnalytics from "../../components/users/UserAnalytics";

import type {
  UserSortDirection,
  UserSortField,
} from "../../components/tables/UserTable";

import {
  usePermissions,
} from "../../hooks/usePermissions";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

import {
  exportUsersToExcel,
  exportUsersToPdf,
} from "../../services/export";

import {
  changeUserStatus,
  deleteUser,
  getUsers,
} from "../../services/userService";

import type {
  User,
  UserRole,
  UserStatus,
} from "../../types/User";

type UserRoleFilter =
  | "Todos"
  | UserRole;

type UserStatusFilter =
  | "Todos"
  | UserStatus;

function compareText(
  firstValue: string,
  secondValue: string
): number {
  return firstValue.localeCompare(
    secondValue,
    "pt-BR",
    {
      sensitivity: "base",
    }
  );
}

function UserListPage() {
  const navigate = useNavigate();

  const { can } = usePermissions();

  const { showSnackbar } =
    useSnackbar();

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    roleFilter,
    setRoleFilter,
  ] = useState<UserRoleFilter>(
    "Todos"
  );

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<UserStatusFilter>(
    "Todos"
  );

  const [
    sortField,
    setSortField,
  ] = useState<UserSortField>(
    "name"
  );

  const [
    sortDirection,
    setSortDirection,
  ] =
    useState<UserSortDirection>(
      "asc"
    );

  const [
    page,
    setPage,
  ] = useState(0);

  const [
    rowsPerPage,
    setRowsPerPage,
  ] = useState(10);

  const [
    users,
    setUsers,
  ] = useState(() => getUsers());

  const [
    selectedUser,
    setSelectedUser,
  ] = useState<User | null>(null);

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const [
    statusDialogOpen,
    setStatusDialogOpen,
  ] = useState(false);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  const [
    statusChangingUserId,
    setStatusChangingUserId,
  ] = useState<number | null>(
    null
  );

  const [
    deleteError,
    setDeleteError,
  ] = useState("");

  const [
    statusError,
    setStatusError,
  ] = useState("");

  const [
    exportMenuAnchor,
    setExportMenuAnchor,
  ] = useState<HTMLElement | null>(
    null
  );

  const exportMenuOpen =
    Boolean(exportMenuAnchor);

  const canCreate = can(
    Permissions.users.create
  );

  const canEdit = can(
    Permissions.users.edit
  );

  const canDelete = can(
    Permissions.users.delete
  );

  const userStatistics =
    useMemo(() => {
      return {
        total: users.length,

        administrators:
          users.filter(
            (user) =>
              user.role ===
              "Administrador"
          ).length,

        technicians:
          users.filter(
            (user) =>
              user.role ===
              "Técnico"
          ).length,

        requesters:
          users.filter(
            (user) =>
              user.role ===
              "Solicitante"
          ).length,

        inactive:
          users.filter(
            (user) =>
              user.status ===
              "Inativo"
          ).length,
      };
    }, [users]);

  const hasActiveFilters =
    search.trim() !== "" ||
    roleFilter !== "Todos" ||
    statusFilter !== "Todos";

  function refreshUsers(): void {
    setUsers(getUsers());
  }

  function handleClearFilters(): void {
    setSearch("");
    setRoleFilter("Todos");
    setStatusFilter("Todos");
    setPage(0);
  }

  function handleSort(
    field: UserSortField
  ): void {
    if (field === sortField) {
      setSortDirection(
        (
          currentDirection
        ): UserSortDirection =>
          currentDirection === "asc"
            ? "desc"
            : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }

    setPage(0);
  }

  function handlePageChange(
    _event: unknown,
    newPage: number
  ): void {
    setPage(newPage);
  }

  function handleRowsPerPageChange(
    event: ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
    >
  ): void {
    const newRowsPerPage =
      Number(event.target.value);

    setRowsPerPage(
      newRowsPerPage
    );

    setPage(0);
  }

  function handleOpenExportMenu(
    event: MouseEvent<HTMLButtonElement>
  ): void {
    setExportMenuAnchor(
      event.currentTarget
    );
  }

  function handleCloseExportMenu(): void {
    setExportMenuAnchor(null);
  }

  function handleExportExcel(): void {
    handleCloseExportMenu();

    try {
      exportUsersToExcel(
        sortedUsers
      );

      showSnackbar(
        "Arquivo Excel gerado com sucesso.",
        {
          severity: "success",
        }
      );
    } catch (error) {
      console.error(
        "Não foi possível exportar os usuários para Excel.",
        error
      );

      showSnackbar(
        "Não foi possível gerar o arquivo Excel.",
        {
          severity: "error",
        }
      );
    }
  }

  function handleExportPdf(): void {
    handleCloseExportMenu();

    try {
      exportUsersToPdf(
        sortedUsers
      );

      showSnackbar(
        "Arquivo PDF gerado com sucesso.",
        {
          severity: "success",
        }
      );
    } catch (error) {
      console.error(
        "Não foi possível exportar os usuários para PDF.",
        error
      );

      showSnackbar(
        "Não foi possível gerar o arquivo PDF.",
        {
          severity: "error",
        }
      );
    }
  }

  function handleOpenStatusDialog(
    user: User
  ): void {
    if (
      !canEdit ||
      statusChangingUserId !== null
    ) {
      return;
    }

    setSelectedUser(user);
    setStatusError("");
    setStatusDialogOpen(true);
  }

  function handleCloseStatusDialog(): void {
    if (
      statusChangingUserId !== null
    ) {
      return;
    }

    setStatusDialogOpen(false);
    setStatusError("");
    setSelectedUser(null);
  }

  async function handleConfirmStatusChange(): Promise<void> {
    if (
      !canEdit ||
      !selectedUser ||
      statusChangingUserId !== null
    ) {
      return;
    }

    const newStatus: UserStatus =
      selectedUser.status ===
      "Ativo"
        ? "Inativo"
        : "Ativo";

    setStatusError("");
    setStatusChangingUserId(
      selectedUser.id
    );

    try {
      await changeUserStatus(
        selectedUser.id,
        newStatus
      );

      refreshUsers();

      setStatusDialogOpen(false);
      setSelectedUser(null);

      showSnackbar(
        newStatus === "Ativo"
          ? "Usuário ativado com sucesso."
          : "Usuário inativado com sucesso.",
        {
          severity: "success",
        }
      );
    } catch (error) {
      console.error(
        "Não foi possível alterar o status do usuário.",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o status do usuário.";

      setStatusError(message);

      showSnackbar(message, {
        severity: "error",
      });

      refreshUsers();
    } finally {
      setStatusChangingUserId(
        null
      );
    }
  }

  function handleOpenDeleteDialog(
    userId: number
  ): void {
    if (
      !canDelete ||
      isDeleting
    ) {
      return;
    }

    const user = users.find(
      (currentUser) =>
        currentUser.id === userId
    );

    if (!user) {
      showSnackbar(
        "Usuário não encontrado.",
        {
          severity: "error",
        }
      );

      return;
    }

    setDeleteError("");
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  }

  function handleCloseDeleteDialog(): void {
    if (isDeleting) {
      return;
    }

    setDeleteError("");
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  }

  function handleConfirmDelete(): void {
    if (
      !canDelete ||
      !selectedUser ||
      isDeleting
    ) {
      return;
    }

    setDeleteError("");
    setIsDeleting(true);

    try {
      const userId =
        selectedUser.id;

      const deleted =
        deleteUser(userId);

      if (!deleted) {
        throw new Error(
          "O serviço não confirmou a exclusão do usuário."
        );
      }

      const updatedUsers =
        getUsers();

      const userStillExists =
        updatedUsers.some(
          (user) =>
            user.id === userId
        );

      if (userStillExists) {
        throw new Error(
          "O usuário permaneceu cadastrado após a exclusão."
        );
      }

      setUsers(updatedUsers);
      setDeleteDialogOpen(false);
      setSelectedUser(null);

      showSnackbar(
        "Usuário excluído com sucesso.",
        {
          severity: "success",
        }
      );
    } catch (error) {
      console.error(
        "Não foi possível excluir o usuário.",
        error
      );

      const failureMessage =
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o usuário. Tente novamente.";

      setDeleteError(
        failureMessage
      );

      showSnackbar(
        failureMessage,
        {
          severity: "error",
        }
      );

      refreshUsers();
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredUsers =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return users.filter(
        (user) => {
          const matchesSearch =
            normalizedSearch === "" ||
            user.name
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            user.email
              .toLowerCase()
              .includes(
                normalizedSearch
              );

          const matchesRole =
            roleFilter === "Todos" ||
            user.role === roleFilter;

          const matchesStatus =
            statusFilter ===
              "Todos" ||
            user.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesRole &&
            matchesStatus
          );
        }
      );
    }, [
      roleFilter,
      search,
      statusFilter,
      users,
    ]);

  const sortedUsers =
    useMemo(() => {
      return [
        ...filteredUsers,
      ].sort(
        (
          firstUser,
          secondUser
        ) => {
          const comparison =
            compareText(
              firstUser[
                sortField
              ],
              secondUser[
                sortField
              ]
            );

          return sortDirection ===
            "asc"
            ? comparison
            : -comparison;
        }
      );
    }, [
      filteredUsers,
      sortDirection,
      sortField,
    ]);

  const paginatedUsers =
    useMemo(() => {
      const start =
        page * rowsPerPage;

      const end =
        start + rowsPerPage;

      return sortedUsers.slice(
        start,
        end
      );
    }, [
      page,
      rowsPerPage,
      sortedUsers,
    ]);

  useEffect(() => {
    const maximumPage =
      Math.max(
        0,
        Math.ceil(
          filteredUsers.length /
            rowsPerPage
        ) - 1
      );

    if (page > maximumPage) {
      setPage(maximumPage);
    }
  }, [
    filteredUsers.length,
    page,
    rowsPerPage,
  ]);

  useEffect(() => {
    setPage(0);
  }, [
    roleFilter,
    search,
    statusFilter,
  ]);

  return (
    <MainLayout title="Usuários">
      <Stack spacing={3}>
        <PageHeader
          title="Usuários"
          subtitle="Gerencie os usuários do sistema."
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(5, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          <StatCard
            title="Total de usuários"
            value={
              userStatistics.total
            }
            color="#1565c0"
            icon={
              <PeopleAltOutlinedIcon />
            }
          />

          <StatCard
            title="Administradores"
            value={
              userStatistics.administrators
            }
            color="#7b1fa2"
            icon={
              <AdminPanelSettingsOutlinedIcon />
            }
          />

          <StatCard
            title="Técnicos"
            value={
              userStatistics.technicians
            }
            color="#00838f"
            icon={
              <EngineeringOutlinedIcon />
            }
          />

          <StatCard
            title="Solicitantes"
            value={
              userStatistics.requesters
            }
            color="#2e7d32"
            icon={
              <PersonOutlineOutlinedIcon />
            }
          />

          <StatCard
            title="Usuários inativos"
            value={
              userStatistics.inactive
            }
            color="#757575"
            icon={
              <PersonOffOutlinedIcon />
            }
          />
        </Box>

        <UserAnalytics
          users={filteredUsers}
        />

        <PageCard>
          <DataTableToolbar>
            <Box
              sx={{
                minWidth: {
                  xs: "100%",
                  md: 300,
                },
                flexGrow: 1,
              }}
            >
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Pesquisar por nome ou e-mail..."
              />
            </Box>

            <FormControl
              size="small"
              sx={{
                minWidth: {
                  xs: "100%",
                  sm: 180,
                },
              }}
            >
              <InputLabel id="user-role-filter-label">
                Perfil
              </InputLabel>

              <Select
                labelId="user-role-filter-label"
                value={roleFilter}
                label="Perfil"
                onChange={(event) =>
                  setRoleFilter(
                    event.target
                      .value as UserRoleFilter
                  )
                }
              >
                <MenuItem value="Todos">
                  Todos os perfis
                </MenuItem>

                <MenuItem value="Administrador">
                  Administrador
                </MenuItem>

                <MenuItem value="Técnico">
                  Técnico
                </MenuItem>

                <MenuItem value="Solicitante">
                  Solicitante
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl
              size="small"
              sx={{
                minWidth: {
                  xs: "100%",
                  sm: 160,
                },
              }}
            >
              <InputLabel id="user-status-filter-label">
                Status
              </InputLabel>

              <Select
                labelId="user-status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(event) =>
                  setStatusFilter(
                    event.target
                      .value as UserStatusFilter
                  )
                }
              >
                <MenuItem value="Todos">
                  Todos os status
                </MenuItem>

                <MenuItem value="Ativo">
                  Ativo
                </MenuItem>

                <MenuItem value="Inativo">
                  Inativo
                </MenuItem>
              </Select>
            </FormControl>

            {hasActiveFilters && (
              <Button
                variant="outlined"
                startIcon={
                  <FilterAltOffOutlinedIcon />
                }
                onClick={
                  handleClearFilters
                }
                sx={{
                  minWidth: {
                    xs: "100%",
                    sm: "auto",
                  },
                  whiteSpace:
                    "nowrap",
                }}
              >
                Limpar filtros
              </Button>
            )}

            <Button
              variant="outlined"
              startIcon={
                <DownloadOutlinedIcon />
              }
              onClick={
                handleOpenExportMenu
              }
              disabled={
                sortedUsers.length === 0
              }
              aria-controls={
                exportMenuOpen
                  ? "users-export-menu"
                  : undefined
              }
              aria-haspopup="true"
              aria-expanded={
                exportMenuOpen
                  ? "true"
                  : undefined
              }
              sx={{
                minWidth: {
                  xs: "100%",
                  sm: "auto",
                },
                whiteSpace: "nowrap",
              }}
            >
              Exportar
            </Button>

            <Menu
              id="users-export-menu"
              anchorEl={
                exportMenuAnchor
              }
              open={exportMenuOpen}
              onClose={
                handleCloseExportMenu
              }
              MenuListProps={{
                "aria-labelledby":
                  "users-export-button",
              }}
            >
              <MenuItem
                onClick={
                  handleExportExcel
                }
              >
                <ListItemIcon>
                  <GridOnOutlinedIcon
                    fontSize="small"
                  />
                </ListItemIcon>

                <ListItemText>
                  Excel (.xlsx)
                </ListItemText>
              </MenuItem>

              <MenuItem
                onClick={
                  handleExportPdf
                }
              >
                <ListItemIcon>
                  <PictureAsPdfOutlinedIcon
                    fontSize="small"
                  />
                </ListItemIcon>

                <ListItemText>
                  PDF (.pdf)
                </ListItemText>
              </MenuItem>
            </Menu>

            {canCreate && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() =>
                  navigate(
                    "/users/new"
                  )
                }
                sx={{
                  minWidth: {
                    xs: "100%",
                    sm: "auto",
                  },
                  whiteSpace:
                    "nowrap",
                }}
              >
                Novo Usuário
              </Button>
            )}
          </DataTableToolbar>

          {filteredUsers.length ===
          0 ? (
            <EmptyState
              title="Nenhum usuário encontrado"
              description={
                hasActiveFilters
                  ? "Não encontramos usuários que correspondam aos filtros informados."
                  : "Ainda não existem usuários cadastrados."
              }
              actionLabel={
                hasActiveFilters
                  ? "Limpar filtros"
                  : canCreate
                    ? "Novo Usuário"
                    : undefined
              }
              onAction={
                hasActiveFilters
                  ? handleClearFilters
                  : canCreate
                    ? () =>
                        navigate(
                          "/users/new"
                        )
                    : undefined
              }
            />
          ) : (
            <>
              <UserTable
                users={
                  paginatedUsers
                }
                sortField={
                  sortField
                }
                sortDirection={
                  sortDirection
                }
                statusChangingUserId={
                  statusChangingUserId
                }
                onSort={handleSort}
                onView={(id) =>
                  navigate(
                    `/users/${id}`
                  )
                }
                onEdit={
                  canEdit
                    ? (id) =>
                        navigate(
                          `/users/${id}/edit`
                        )
                    : undefined
                }
                onStatusChange={
                  canEdit
                    ? handleOpenStatusDialog
                    : undefined
                }
                onDelete={
                  canDelete
                    ? handleOpenDeleteDialog
                    : undefined
                }
              />

              <DataTablePagination
                count={
                  filteredUsers.length
                }
                page={page}
                rowsPerPage={
                  rowsPerPage
                }
                label="Usuários por página:"
                onPageChange={
                  handlePageChange
                }
                onRowsPerPageChange={
                  handleRowsPerPageChange
                }
              />
            </>
          )}
        </PageCard>
      </Stack>

      <Dialog
        open={
          statusDialogOpen &&
          selectedUser !== null
        }
        onClose={
          statusChangingUserId !==
          null
            ? undefined
            : handleCloseStatusDialog
        }
        fullWidth
        maxWidth="xs"
        disableEscapeKeyDown={
          statusChangingUserId !==
          null
        }
      >
        <DialogTitle>
          {selectedUser?.status ===
          "Ativo"
            ? "Inativar usuário"
            : "Ativar usuário"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <DialogContentText>
              Tem certeza de que
              deseja{" "}
              {selectedUser?.status ===
              "Ativo"
                ? "inativar"
                : "ativar"}{" "}
              o usuário{" "}
              <strong>
                {selectedUser?.name}
              </strong>
              ?
            </DialogContentText>

            {statusError && (
              <Alert
                severity="error"
                onClose={
                  statusChangingUserId !==
                  null
                    ? undefined
                    : () =>
                        setStatusError(
                          ""
                        )
                }
              >
                {statusError}
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={
              handleCloseStatusDialog
            }
            disabled={
              statusChangingUserId !==
              null
            }
          >
            Cancelar
          </Button>

          <Button
            color={
              selectedUser?.status ===
              "Ativo"
                ? "warning"
                : "success"
            }
            variant="contained"
            onClick={
              handleConfirmStatusChange
            }
            disabled={
              statusChangingUserId !==
              null
            }
            startIcon={
              statusChangingUserId !==
              null ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : undefined
            }
          >
            {statusChangingUserId !==
            null
              ? "Atualizando..."
              : selectedUser?.status ===
                  "Ativo"
                ? "Inativar"
                : "Ativar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={
          deleteDialogOpen &&
          selectedUser !== null
        }
        onClose={
          isDeleting
            ? undefined
            : handleCloseDeleteDialog
        }
        fullWidth
        maxWidth="xs"
        disableEscapeKeyDown={
          isDeleting
        }
      >
        <DialogTitle>
          Excluir usuário
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <DialogContentText>
              Tem certeza de que
              deseja excluir o usuário{" "}
              <strong>
                {selectedUser?.name}
              </strong>
              ? Esta ação não poderá
              ser desfeita.
            </DialogContentText>

            {deleteError && (
              <Alert
                severity="error"
                onClose={
                  isDeleting
                    ? undefined
                    : () =>
                        setDeleteError(
                          ""
                        )
                }
              >
                {deleteError}
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={
              handleCloseDeleteDialog
            }
            disabled={isDeleting}
          >
            Cancelar
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={
              handleConfirmDelete
            }
            disabled={isDeleting}
            startIcon={
              isDeleting ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : undefined
            }
          >
            {isDeleting
              ? "Excluindo..."
              : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}

export default UserListPage;