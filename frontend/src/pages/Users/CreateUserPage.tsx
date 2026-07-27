import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

import { createUser } from "../../services/userService";

function CreateUserPage() {
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");

  function handleSubmit(values: UserFormData) {
    try {
      setErrorMessage("");

      createUser({
        ...values,
        createdAt: new Date().toISOString(),
      });

      navigate("/users");
    } catch {
      setErrorMessage(
        "Não foi possível cadastrar o usuário. Tente novamente."
      );
    }
  }

  return (
    <MainLayout title="Novo Usuário">
      <PageHeader
        title="Novo Usuário"
        subtitle="Cadastre um novo usuário no sistema."
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
          Preencha os dados abaixo para realizar o cadastro.
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
          onSubmit={handleSubmit}
          submitLabel="Cadastrar usuário"
        />
      </Paper>
    </MainLayout>
  );
}

export default CreateUserPage;