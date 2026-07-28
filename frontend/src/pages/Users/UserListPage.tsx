import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
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
  deleteUser,
  getUsers,
} from "../../services/userService";

function UserListPage() {
  const navigate = useNavigate();

  const { can } = usePermissions();

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(getUsers());

  const canCreate = can(Permissions.users.create);
  const canEdit = can(Permissions.users.edit);
  const canDelete = can(Permissions.users.delete);

  function refreshUsers() {
    setUsers(getUsers());
  }

  function handleDelete(id: number) {
    if (!canDelete) {
      return;
    }

    const confirmed = window.confirm(
      "Deseja realmente excluir este usuário?"
    );

    if (!confirmed) {
      return;
    }

    deleteUser(id);
    refreshUsers();
  }

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();

    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value)
      );
    });
  }, [search, users]);

  return (
    <MainLayout title="Usuários">
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
              onClick={() => navigate("/users/new")}
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
              canCreate ? "Novo Usuário" : undefined
            }
            onAction={
              canCreate
                ? () => navigate("/users/new")
                : undefined
            }
          />
        ) : (
          <UserTable
            users={filteredUsers}
            onView={(id) => navigate(`/users/${id}`)}
            onEdit={
              canEdit
                ? (id) =>
                    navigate(`/users/${id}/edit`)
                : undefined
            }
            onDelete={
              canDelete
                ? handleDelete
                : undefined
            }
          />
        )}
      </PageCard>
    </MainLayout>
  );
}

export default UserListPage;