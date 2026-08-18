import {
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Paper,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
} from "@mui/icons-material";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import StoreForm from "../../components/forms/StoreForm";

import type {
  StoreFormData,
} from "../../components/forms/StoreForm";

import MainLayout from "../../components/layout/MainLayout";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

import {
  getStoreById,
  updateStore,
} from "../../services/storeService";

function EditStorePage() {
  const navigate =
    useNavigate();

  const {
    id,
  } = useParams();

  const {
    showSnackbar,
  } = useSnackbar();

  const storeId =
    Number(
      id
    );

  const store =
    getStoreById(
      storeId
    );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  function handleBack():
    void {
    if (
      isSaving
    ) {
      return;
    }

    if (
      store
    ) {
      navigate(
        `/stores/${store.id}`
      );

      return;
    }

    navigate(
      "/stores"
    );
  }

  function handleSubmit(
    values:
      StoreFormData
  ): void {
    if (
      isSaving ||
      !store
    ) {
      return;
    }

    setErrorMessage("");

    try {
      setIsSaving(
        true
      );

      const updatedStore =
        updateStore(
          store.id,
          values
        );

      if (
        !updatedStore
      ) {
        throw new Error(
          "A loja não foi encontrada."
        );
      }

      showSnackbar(
        "Loja atualizada com sucesso.",
        {
          severity:
            "success",
        }
      );

      navigate(
        `/stores/${updatedStore.id}`
      );
    } catch (error) {
      console.error(
        "Não foi possível atualizar a loja.",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a loja.";

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
      setIsSaving(
        false
      );
    }
  }

  if (
    !Number.isInteger(
      storeId
    ) ||
    storeId <= 0 ||
    !store
  ) {
    return (
      <MainLayout title="Editar Loja">
        <Alert severity="error">
          Loja não encontrada.
        </Alert>

        <Button
          variant="outlined"
          startIcon={
            <ArrowBack />
          }
          onClick={() =>
            navigate(
              "/stores"
            )
          }
          sx={{
            mt:
              2,
          }}
        >
          Voltar para lojas
        </Button>
      </MainLayout>
    );
  }

  const initialValues:
    StoreFormData = {
      code:
        store.code,

      name:
        store.name,

      status:
        store.status,

      address:
        store.address,

      city:
        store.city,

      state:
        store.state,

      zipCode:
        store.zipCode,

      phone:
        store.phone,

      email:
        store.email,

      manager:
        store.manager,

      notes:
        store.notes,
    };

  return (
    <MainLayout title="Editar Loja">
      <Box
        sx={{
          maxWidth:
            960,
        }}
      >
        <Button
          variant="text"
          startIcon={
            <ArrowBack />
          }
          onClick={
            handleBack
          }
          disabled={
            isSaving
          }
          sx={{
            mb:
              2,
          }}
        >
          Voltar aos detalhes
        </Button>

        <Typography
          variant="h4"
          component="h1"
          fontWeight={700}
          sx={{
            mb:
              1,
          }}
        >
          Editar loja
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mb:
              3,
          }}
        >
          Atualize as informações da unidade.
        </Typography>

        {errorMessage && (
          <Alert
            severity="error"
            sx={{
              mb:
                3,
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

        <Paper
          sx={{
            p: {
              xs:
                2.5,

              md:
                4,
            },
          }}
        >
          <StoreForm
            initialValues={
              initialValues
            }
            onSubmit={
              handleSubmit
            }
            onCancel={
              handleBack
            }
            saving={
              isSaving
            }
            submitLabel="Salvar alterações"
          />
        </Paper>
      </Box>
    </MainLayout>
  );
}

export default EditStorePage;