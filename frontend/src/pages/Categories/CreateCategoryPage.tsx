import {
  useState,
} from "react";

import {
  useNavigate,
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
import CategoryForm from "../../components/forms/CategoryForm";

import type {
  CategoryFormData,
} from "../../components/forms/CategoryForm";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

import {
  createCategory,
} from "../../services/categoryService";

function CreateCategoryPage() {
  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  async function handleSubmit(
    values: CategoryFormData
  ): Promise<void> {
    if (saving) {
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      const category =
        await createCategory(values);

      showSnackbar(
        "Categoria criada com sucesso.",
        {
          severity: "success",
        }
      );

      navigate(
        `/categories/${category.id}`
      );
    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar a categoria.";

      setErrorMessage(message);

      showSnackbar(message, {
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  function handleBack(): void {
    if (saving) {
      return;
    }

    navigate("/categories");
  }

  return (
    <MainLayout title="Nova Categoria">
      <PageHeader
        title="Nova Categoria"
        subtitle="Cadastre uma nova categoria de chamados."
      />

      <Box
        sx={{
          mt: 3,
          mb: 2,
        }}
      >
        <Button
          variant="outlined"
          disabled={saving}
          onClick={handleBack}
        >
          Voltar para categorias
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
          Informações da categoria
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          mb={3}
        >
          Preencha os dados abaixo para criar uma nova categoria.
        </Typography>

        {errorMessage && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            onClose={() =>
              setErrorMessage("")
            }
          >
            {errorMessage}
          </Alert>
        )}

        <CategoryForm
          onSubmit={handleSubmit}
          submitLabel={
            saving
              ? "Salvando..."
              : "Cadastrar Categoria"
          }
        />
      </Paper>
    </MainLayout>
  );
}

export default CreateCategoryPage;