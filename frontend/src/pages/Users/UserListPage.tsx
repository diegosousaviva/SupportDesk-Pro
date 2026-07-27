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
  deleteUser,
  getUsers,
} from "../../services/userService";

function UserListPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(getUsers());

  function refreshUsers() {
    setUsers(getUsers());
  }

  function handleDelete(id: number) {
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

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/users/new")}
          >
            Novo Usuário
          </Button>
        </DataTableToolbar>

        {filteredUsers.length === 0 ? (
          <EmptyState
            title="Nenhum usuário encontrado"
            description="Não encontramos usuários com os filtros informados."
            actionLabel="Novo Usuário"
            onAction={() => navigate("/users/new")}
          />
        ) : (
          <UserTable
            users={filteredUsers}
            onView={(id) => navigate(`/users/${id}`)}
            onEdit={(id) => navigate(`/users/${id}/edit`)}
            onDelete={handleDelete}
          />
        )}
      </PageCard>
    </MainLayout>
  );
}

export default UserListPage;