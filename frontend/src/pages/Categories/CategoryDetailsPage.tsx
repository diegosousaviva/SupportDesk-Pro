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
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LabelIcon from "@mui/icons-material/Label";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import {
  Permissions,
} from "../../auth/permissions";

import MainLayout from "../../components/layout/MainLayout";
import PageHeader from "../../components/common/PageHeader";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import {
  usePermissions,
} from "../../hooks/usePermissions";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

import {
  deleteCategory,
  getCategoryById,
} from "../../services/categoryService";

function formatDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Data não informada";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "long",
      timeStyle: "short",
    }
  ).format(parsedDate);
}

function CategoryDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { can } = usePermissions();
  const { showSnackbar } = useSnackbar();

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const categoryId = Number(id);

  const category = useMemo(() => {
    if (!Number.isInteger(categoryId)) {
      return undefined;
    }

    return getCategoryById(categoryId);
  }, [categoryId]);

  const canEdit = can(
    Permissions.categories.edit
  );

  const canDelete = can(
    Permissions.categories.delete
  );

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

  const currentCategoryId =
    category.id;

  function handleBack(): void {
    if (deleting) {
      return;
    }

    navigate("/categories");
  }

  function handleEdit(): void {
    if (!canEdit || deleting) {
      return;
    }

    navigate(
      `/categories/${currentCategoryId}/edit`
    );
  }

  function handleOpenDeleteDialog(): void {
    if (!canDelete || deleting) {
      return;
    }

    setErrorMessage("");
    setDeleteDialogOpen(true);
  }

  function handleCloseDeleteDialog(): void {
    if (deleting) {
      return;
    }

    setErrorMessage("");
    setDeleteDialogOpen(false);
  }

  function handleDelete(): void {
    if (!canDelete || deleting) {
      return;
    }

    setDeleting(true);
    setErrorMessage("");

    try {
      const deleted = deleteCategory(
        currentCategoryId
      );

      if (!deleted) {
        throw new Error(
          "Não foi possível localizar a categoria para exclusão."
        );
      }

      setDeleteDialogOpen(false);

      showSnackbar(
        "Categoria excluída com sucesso.",
        {
          severity: "success",
        }
      );

      navigate("/categories");
    } catch (error) {
      console.error(
        "Não foi possível excluir a categoria.",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao excluir a categoria.";

      setErrorMessage(message);

      showSnackbar(message, {
        severity: "error",
      });

      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <MainLayout title="Detalhes da Categoria">
      <PageHeader
        title="Detalhes da Categoria"
        subtitle="Consulte as informações da categoria."
      />

      <Box
        sx={{
          mt: 3,
          mb: 2,
          display: "flex",
          justifyContent:
            "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          startIcon={
            <ArrowBackIcon />
          }
          disabled={deleting}
          onClick={handleBack}
        >
          Voltar para categorias
        </Button>

        {(canEdit || canDelete) && (
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1.5}
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },
            }}
          >
            {canEdit && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                disabled={deleting}
                onClick={handleEdit}
              >
                Editar
              </Button>
            )}

            {canDelete && (
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                disabled={deleting}
                onClick={
                  handleOpenDeleteDialog
                }
              >
                Excluir
              </Button>
            )}
          </Stack>
        )}
      </Box>

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

      <Paper
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={3}
          alignItems={{
            xs: "flex-start",
            sm: "center",
          }}
        >
          <Avatar
            sx={{
              bgcolor: category.color,
              width: 88,
              height: 88,
              fontSize: 34,
            }}
          >
            <LabelIcon fontSize="large" />
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h5"
              fontWeight={700}
            >
              {category.name}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              mt={0.5}
            >
              Categoria #{currentCategoryId}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              mt={2}
              flexWrap="wrap"
              useFlexGap
            >
              <Chip
                label={
                  category.active
                    ? "Ativa"
                    : "Inativa"
                }
                color={
                  category.active
                    ? "success"
                    : "default"
                }
              />

              <Chip
                label={category.color}
                variant="outlined"
                avatar={
                  <Avatar
                    sx={{
                      bgcolor:
                        category.color,
                    }}
                  >
                    {" "}
                  </Avatar>
                }
              />
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="flex-start"
            >
              <DescriptionIcon color="primary" />

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Descrição
                </Typography>

                <Typography fontWeight={600}>
                  {category.description ||
                    "Não informada"}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="flex-start"
            >
              <CalendarMonthIcon color="primary" />

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Criada em
                </Typography>

                <Typography fontWeight={600}>
                  {formatDate(
                    category.createdAt
                  )}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="flex-start"
            >
              <CalendarMonthIcon color="primary" />

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Última atualização
                </Typography>

                <Typography fontWeight={600}>
                  {formatDate(
                    category.updatedAt
                  )}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <ConfirmDialog
        open={
          deleteDialogOpen &&
          canDelete
        }
        title="Excluir categoria"
        message={`Deseja realmente excluir a categoria "${category.name}"? Esta ação não poderá ser desfeita.`}
        confirmLabel="Excluir categoria"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={
          handleCloseDeleteDialog
        }
      />
    </MainLayout>
  );
}

export default CategoryDetailsPage;