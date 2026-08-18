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
  createStore,
} from "../../services/storeService";

function CreateStorePage() {
  const navigate =
    useNavigate();

  const {
    showSnackbar,
  } = useSnackbar();

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

    navigate(
      "/stores"
    );
  }

  function handleSubmit(
    values:
      StoreFormData
  ): void {
    if (
      isSaving
    ) {
      return;
    }

    setErrorMessage("");

    try {
      setIsSaving(
        true
      );

      const createdStore =
        createStore(
          values
        );

      showSnackbar(
        "Loja cadastrada com sucesso.",
        {
          severity:
            "success",
        }
      );

      navigate(
        `/stores/${createdStore.id}`
      );
    } catch (error) {
      console.error(
        "Não foi possível cadastrar a loja.",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar a loja.";

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

  return (
    <MainLayout title="Nova Loja">
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
          Voltar para lojas
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
          Cadastrar nova loja
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mb:
              3,
          }}
        >
          Informe os dados da unidade que será utilizada no inventário.
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
            onSubmit={
              handleSubmit
            }
            onCancel={
              handleBack
            }
            saving={
              isSaving
            }
            submitLabel="Salvar loja"
          />
        </Paper>
      </Box>
    </MainLayout>
  );
}

export default CreateStorePage;