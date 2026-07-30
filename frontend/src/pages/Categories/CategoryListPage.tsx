import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Box,
  Button,
  Paper,
  TextField,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import MainLayout from "../../components/layout/MainLayout";
import PageHeader from "../../components/common/PageHeader";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CategoryStatistics from "../../components/categories/CategoryStatistics";
import CategoryTable from "../../components/categories/CategoryTable";

import {
  usePermissions,
} from "../../hooks/usePermissions";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

import {
  Permissions,
} from "../../auth/permissions";

import {
  deleteCategory,
  getCategories,
} from "../../services/categoryService";

import type {
  Category,
} from "../../types/Category";

function CategoryListPage() {
  const navigate = useNavigate();

  const { can } = usePermissions();

  const {
    showSuccess,
    showError,
  } = useSnackbar();

  const [search, setSearch] =
    useState("");

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [
    selectedCategoryId,
    setSelectedCategoryId,
  ] = useState<number | null>(null);

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const [deleting, setDeleting] =
    useState(false);

  useEffect(() => {
    setCategories(getCategories());
  }, []);

  const filteredCategories =
    useMemo(() => {
      const value = search
        .trim()
        .toLowerCase();

      return categories.filter(
        (category) =>
          category.name
            .toLowerCase()
            .includes(value) ||
          category.description
            .toLowerCase()
            .includes(value)
      );
    }, [categories, search]);

  function handleDeleteClick(
    id: number
  ) {
    setSelectedCategoryId(id);
    setDeleteDialogOpen(true);
  }

  function handleCancelDelete() {
    if (deleting) {
      return;
    }

    setDeleteDialogOpen(false);
    setSelectedCategoryId(null);
  }

  async function handleConfirmDelete() {
    if (selectedCategoryId === null) {
      return;
    }

    const categoryId =
      selectedCategoryId;

    try {
      setDeleting(true);

      await Promise.resolve(
        deleteCategory(categoryId)
      );

      setCategories(
        (currentCategories) =>
          currentCategories.filter(
            (category) =>
              category.id !== categoryId
          )
      );

      setDeleteDialogOpen(false);
      setSelectedCategoryId(null);

      showSuccess(
        "Categoria excluída com sucesso."
      );
    } catch (error) {
      console.error(
        "Erro ao excluir categoria:",
        error
      );

      setDeleteDialogOpen(false);
      setSelectedCategoryId(null);

      showError(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a categoria."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <MainLayout title="Categorias">
      <PageHeader
        title="Categorias"
        subtitle="Gerencie as categorias de chamados."
      />

      <CategoryStatistics
        categories={filteredCategories}
      />

      <Paper
        sx={{
          p: 2,
          mb: 3,
        }}
      >
        <Box
          display="flex"
          gap={2}
          flexWrap="wrap"
          justifyContent="space-between"
        >
          <TextField
            label="Pesquisar categoria"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            sx={{
              minWidth: 300,
              flex: 1,
            }}
          />

          {can(
            Permissions.categories.create
          ) && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() =>
                navigate(
                  "/categories/new"
                )
              }
            >
              Nova Categoria
            </Button>
          )}
        </Box>
      </Paper>

      <CategoryTable
        categories={
          filteredCategories
        }
        onView={(id) =>
          navigate(
            `/categories/${id}`
          )
        }
        onEdit={(id) =>
          navigate(
            `/categories/${id}/edit`
          )
        }
        onDelete={
          handleDeleteClick
        }
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Excluir categoria"
        message="Deseja realmente excluir esta categoria?"
        confirmLabel="Excluir"
        confirmColor="error"
        loading={deleting}
        onCancel={
          handleCancelDelete
        }
        onConfirm={
          handleConfirmDelete
        }
      />
    </MainLayout>
  );
}

export default CategoryListPage;