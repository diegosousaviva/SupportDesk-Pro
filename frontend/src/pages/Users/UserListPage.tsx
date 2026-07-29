import {
  useMemo,
  useState,
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
  Stack,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import MainLayout from "../../components/layout/MainLayout";
import DataTableToolbar from "../../components/common/DataTableToolbar";
import EmptyState from "../../components/common/EmptyState";
import PageCard from "../../components/common/PageCard";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import UserTable from "../../components/tables/UserTable";

import {
  Permissions,
} from "../../auth/permissions";

import {
  usePermissions,
} from "../../hooks/usePermissions";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

import {
  deleteUser,
  getUsers,
} from "../../services/userService";

import type {
  User,
} from "../../types/User";

function UserListPage() {
  const navigate = useNavigate();

  const { can } = usePermissions();
  const { showSnackbar } = useSnackbar();

  const [search, setSearch] =
    useState("");

  const [users, setUsers] =
    useState(() => getUsers());

  const [
    selectedUser,
    setSelectedUser,
  ] = useState<User | null>(null);

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  const [
    deleteError,
    setDeleteError,
  ] = useState("");

  const canCreate = can(
    Permissions.users.create
  );

  const canEdit = can(
    Permissions.users.edit
  );

  const canDelete = can(
    Permissions.users.delete
  );

  function refreshUsers(): void {
    setUsers(getUsers());
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
      const userId = selectedUser.id;

      deleteUser(userId);

      const updatedUsers = getUsers();

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
        "Não foi possível excluir o usuário. Tente novamente.";

      setDeleteError(failureMessage);

      showSnackbar(
        "Não foi possível excluir o usuário.",
        {
          severity: "error",
        }
      );

      refreshUsers();
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    return users.filter((user) => {
      return (
        user.name
          .toLowerCase()
          .includes(value) ||
        user.email
          .toLowerCase()
          .includes(value)
      );
    });
  }, [search, users]);

  return (
    <MainLayout title="Usuários">
      <Stack spacing={3}>
        <PageHeader
          title="Usuários"
          subtitle="Gerencie os usuários do sistema."
        />

        <PageCard>
          <DataTableToolbar>
            <Box
              sx={{
                minWidth: {
                  xs: "100%",
                  sm: 320,
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

            {canCreate && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() =>
                  navigate("/users/new")
                }
              >
                Novo Usuário
              </Button>
            )}
          </DataTableToolbar>

          {filteredUsers.length === 0 ? (
            <EmptyState
              title="Nenhum usuário encontrado"
              description="Não encontramos usuários com os filtros informados."
              actionLabel={
                canCreate
                  ? "Novo Usuário"
                  : undefined
              }
              onAction={
                canCreate
                  ? () =>
                      navigate(
                        "/users/new"
                      )
                  : undefined
              }
            />
          ) : (
            <UserTable
              users={filteredUsers}
              onView={(id) =>
                navigate(`/users/${id}`)
              }
              onEdit={
                canEdit
                  ? (id) =>
                      navigate(
                        `/users/${id}/edit`
                      )
                  : undefined
              }
              onDelete={
                canDelete
                  ? handleOpenDeleteDialog
                  : undefined
              }
            />
          )}
        </PageCard>
      </Stack>

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
        disableEscapeKeyDown={isDeleting}
      >
        <DialogTitle>
          Excluir usuário
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <DialogContentText>
              Tem certeza de que deseja excluir o
              usuário{" "}
              <strong>
                {selectedUser?.name}
              </strong>
              ? Esta ação não poderá ser desfeita.
            </DialogContentText>

            {deleteError && (
              <Alert
                severity="error"
                onClose={
                  isDeleting
                    ? undefined
                    : () =>
                        setDeleteError("")
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