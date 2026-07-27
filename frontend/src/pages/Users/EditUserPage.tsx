import { useMemo, useState } from "react";
import {
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Paper,
  Typography,
} from "@mui/material";

import MainLayout from "../../components/layout/MainLayout";
import PageHeader from "../../components/common/PageHeader";
import UserForm from "../../components/forms/UserForm";

import type { UserFormData } from "../../components/forms/UserForm";

import {
  getUserById,
  updateUser,
} from "../../services/userService";

function EditUserPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [errorMessage, setErrorMessage] = useState("");

  const userId = Number(id);

  const user = useMemo(() => {
    if (!Number.isInteger(userId)) {
      return undefined;
    }

    return getUserById(userId);
  }, [userId]);

  if (!Number.isInteger(userId) || !user) {
    return <Navigate to="/users" replace />;
  }

  const currentUserId = user.id;

  const initialValues: UserFormData = {
    name: user.name,
    email: user.email,
    phone: user.phone,
    department: user.department,
    role: user.role,
    status: user.status,
  };

  function handleSubmit(values: UserFormData) {
    try {
      setErrorMessage("");

      const updatedUser = updateUser(currentUserId, values);

      if (!updatedUser) {
        setErrorMessage(
          "Não foi possível localizar o usuário para atualização."
        );

        return;
      }

      navigate(`/users/${currentUserId}`);
    } catch {
      setErrorMessage(
        "Não foi possível atualizar o usuário. Tente novamente."
      );
    }
  }

  return (
    <MainLayout title="Editar Usuário">
      <PageHeader
        title="Editar Usuário"
        subtitle={`Atualize as informações de ${user.name}.`}
      />

      <Box
        sx={{
          mt: 3,
          mb: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={() => navigate("/users")}
        >
          Voltar para usuários
        </Button>
      </Box>

      <Paper
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          mb={0.5}
        >
          Informações do usuário
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          mb={3}
        >
          Altere os campos necessários e salve as mudanças.
        </Typography>

        {errorMessage && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
          >
            {errorMessage}
          </Alert>
        )}

        <UserForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitLabel="Salvar alterações"
        />
      </Paper>
    </MainLayout>
  );
}

export default EditUserPage;