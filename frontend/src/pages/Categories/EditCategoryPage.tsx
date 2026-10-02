import { useEffect, useState } from "react";

import {
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
  const navigate =
    useNavigate();

  const {
    id,
  } = useParams();

  const {
    showSnackbar,
  } = useSnackbar();

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const categoryId =
    Number(id);

  const [category, setCategory] = useState<Awaited<ReturnType<typeof getCategoryById>>>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!Number.isSafeInteger(categoryId) || categoryId < 1) {
      setCategory(undefined);
      setLoading(false);
      return () => { cancelled = true; };
    }
    setLoading(true);
    getCategoryById(categoryId)
      .then((result) => { if (!cancelled) setCategory(result); })
      .catch((error: unknown) => {
        if (!cancelled) setErrorMessage(error instanceof Error ? error.message : "Não foi possível carregar a categoria.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [categoryId]);

  if (loading) {
    return <MainLayout title="Editar Categoria"><Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box></MainLayout>;
  }

  if (!Number.isInteger(categoryId) || !category) {
    return (
      errorMessage
        ? <MainLayout title="Editar Categoria"><Alert severity="error">{errorMessage}</Alert><Button onClick={() => navigate("/categories")}>Voltar para categorias</Button></MainLayout>
        : <Navigate to="/categories" replace />
    );
  }

  const activeCategory =
    category;

  const activeCategoryId =
    activeCategory.id;

  const initialValues:
    CategoryFormData = {
      name:
        activeCategory.name,

      description:
        activeCategory.description,

      color:
        activeCategory.color,

      active:
        activeCategory.active,
    };

  async function handleSubmit(
    values:
      CategoryFormData
  ): Promise<void> {
    if (
      saving
    ) {
      return;
    }

    setSaving(
      true
    );

    setErrorMessage(
      ""
    );

    try {
      const updated =
        await updateCategory(
          activeCategoryId,
          values
        );

      if (
        !updated
      ) {
        throw new Error(
          "Categoria não encontrada."
        );
      }

      showSnackbar(
        "Categoria atualizada com sucesso.",
        {
          severity:
            "success",
        }
      );

      navigate(
        `/categories/${activeCategoryId}`
      );
    } catch (error) {
      console.error(
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a categoria.";

      setErrorMessage(
        message
      );

      showSnackbar(
        message,
        {
          severity:
            "error",
        }
      );
    } finally {
      setSaving(
        false
      );
    }
  }

  function handleBack():
    void {
    if (
      saving
    ) {
      return;
    }

    navigate(
      `/categories/${activeCategoryId}`
    );
  }

  return (
    <MainLayout title="Editar Categoria">
      <PageHeader
        title="Editar Categoria"
        subtitle={`Atualize as informações de "${activeCategory.name}".`}
      />

      <Box
        sx={{
          mt: 3,
          mb: 2,
        }}
      >
        <Button
          variant="outlined"
          disabled={
            saving
          }
          onClick={
            handleBack
          }
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
            sx={{
              mb: 3,
            }}
            onClose={() =>
              setErrorMessage(
                ""
              )
            }
          >
            {errorMessage}
          </Alert>
        )}

        <CategoryForm
          isEdit
          initialValues={
            initialValues
          }
          onSubmit={
            handleSubmit
          }
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
