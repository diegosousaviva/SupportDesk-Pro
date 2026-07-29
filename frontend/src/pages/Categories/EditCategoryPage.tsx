import {
  useMemo,
  useState,
} from "react";

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
import CategoryForm from "../../components/forms/CategoryForm";

import type {
  CategoryFormData,
} from "../../components/forms/CategoryForm";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

import {
  getCategoryById,
  updateCategory,
} from "../../services/categoryService";

function EditCategoryPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { showSnackbar } =
    useSnackbar();

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const categoryId = Number(id);

  const category = useMemo(() => {
    if (!Number.isInteger(categoryId)) {
      return undefined;
    }

    return getCategoryById(categoryId);
  }, [categoryId]);

  if (
    !Number.isInteger(categoryId) ||
    !category
  ) {
    return (
      <Navigate
        to="/categories"
        replace
      />
    );
  }

  const initialValues: CategoryFormData = {
    name: category.name,
    description:
      category.description,
    color: category.color,
    active: category.active,
  };

  async function handleSubmit(
    values: CategoryFormData
  ): Promise<void> {
    if (saving) {
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      const updated =
        await updateCategory(
          category.id,
          values
        );

      if (!updated) {
        throw new Error(
          "Categoria não encontrada."
        );
      }

      showSnackbar(
        "Categoria atualizada com sucesso.",
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
          : "Não foi possível atualizar a categoria.";

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

    navigate(
      `/categories/${category.id}`
    );
  }

  return (
    <MainLayout title="Editar Categoria">
      <PageHeader
        title="Editar Categoria"
        subtitle={`Atualize as informações de "${category.name}".`}
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
          Voltar aos detalhes
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
          Atualize os dados da categoria.
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
          isEdit
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitLabel={
            saving
              ? "Salvando..."
              : "Salvar alterações"
          }
        />
      </Paper>
    </MainLayout>
  );
}

export default EditCategoryPage;