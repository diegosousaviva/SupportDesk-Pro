import {
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
import CategoryStatistics from "../../components/categories/CategoryStatistics";
import CategoryTable from "../../components/categories/CategoryTable";

import {
  usePermissions,
} from "../../hooks/usePermissions";

import {
  Permissions,
} from "../../auth/permissions";

import {
  getCategories,
} from "../../services/categoryService";

function CategoryListPage() {
  const navigate = useNavigate();

  const { can } = usePermissions();

  const [search, setSearch] =
    useState("");

  const categories = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    return getCategories().filter(
      (category) =>
        category.name
          .toLowerCase()
          .includes(value) ||
        category.description
          .toLowerCase()
          .includes(value)
    );
  }, [search]);

  return (
    <MainLayout title="Categorias">
      <PageHeader
        title="Categorias"
        subtitle="Gerencie as categorias de chamados."
      />

      <CategoryStatistics
        categories={categories}
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
        categories={categories}
        onView={(id) =>
          navigate(`/categories/${id}`)
        }
        onEdit={(id) =>
          navigate(
            `/categories/${id}/edit`
          )
        }
        onDelete={(id) =>
          console.log(
            "Excluir categoria:",
            id
          )
        }
      />
    </MainLayout>
  );
}

export default CategoryListPage;