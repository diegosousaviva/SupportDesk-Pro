import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  Save,
} from "@mui/icons-material";

import MainLayout from "../../components/layout/MainLayout";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

import {
  createStore,
} from "../../services/storeService";

import type {
  StoreStatus,
} from "../../types/Store";

function CreateStorePage() {
  const navigate =
    useNavigate();

  const {
    showSnackbar,
  } = useSnackbar();

  const [
    code,
    setCode,
  ] = useState("");

  const [
    name,
    setName,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState<StoreStatus>(
    "Ativa"
  );

  const [
    address,
    setAddress,
  ] = useState("");

  const [
    city,
    setCity,
  ] = useState("");

  const [
    state,
    setState,
  ] = useState("");

  const [
    zipCode,
    setZipCode,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    manager,
    setManager,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  function handleBack(): void {
    if (isSaving) {
      return;
    }

    navigate(
      "/stores"
    );
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): void {
    event.preventDefault();

    setErrorMessage("");

    try {
      setIsSaving(true);

      const createdStore =
        createStore({
          code,
          name,
          status,
          address,
          city,
          state,
          zipCode,
          phone,
          email,
          manager,
          notes,
        });

      showSnackbar(
        "Loja cadastrada com sucesso.",
        {
          severity: "success",
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
          severity: "error",
        }
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <MainLayout title="Nova Loja">
      <Box
        sx={{
          maxWidth: 960,
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
            mb: 2,
          }}
        >
          Voltar para lojas
        </Button>

        <Typography
          variant="h4"
          component="h1"
          fontWeight={700}
          sx={{
            mb: 1,
          }}
        >
          Cadastrar nova loja
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mb: 3,
          }}
        >
          Informe os dados da unidade que será utilizada
          no inventário.
        </Typography>

        {errorMessage && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
            }}
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
              xs: 2.5,
              md: 4,
            },
          }}
        >
          <Box
            component="form"
            onSubmit={
              handleSubmit
            }
          >
            <Stack spacing={3}>
              <Stack
                direction={{
                  xs: "column",
                  md: "row",
                }}
                spacing={2}
              >
                <TextField
                  label="Código da loja"
                  value={code}
                  onChange={(event) =>
                    setCode(
                      event.target.value
                    )
                  }
                  helperText="Exemplo: LJ001"
                  fullWidth
                  required
                  disabled={
                    isSaving
                  }
                  slotProps={{
                    htmlInput: {
                      maxLength: 20,
                    },
                  }}
                />

                <TextField
                  label="Nome da loja"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  fullWidth
                  required
                  disabled={
                    isSaving
                  }
                  slotProps={{
                    htmlInput: {
                      maxLength: 100,
                    },
                  }}
                />

                <TextField
                  select
                  label="Status"
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target
                        .value as StoreStatus
                    )
                  }
                  fullWidth
                  disabled={
                    isSaving
                  }
                >
                  <MenuItem value="Ativa">
                    Ativa
                  </MenuItem>

                  <MenuItem value="Inativa">
                    Inativa
                  </MenuItem>
                </TextField>
              </Stack>

              <TextField
                label="Endereço"
                value={address}
                onChange={(event) =>
                  setAddress(
                    event.target.value
                  )
                }
                fullWidth
                disabled={
                  isSaving
                }
              />

              <Stack
                direction={{
                  xs: "column",
                  md: "row",
                }}
                spacing={2}
              >
                <TextField
                  label="Cidade"
                  value={city}
                  onChange={(event) =>
                    setCity(
                      event.target.value
                    )
                  }
                  fullWidth
                  disabled={
                    isSaving
                  }
                />

                <TextField
                  label="Estado"
                  value={state}
                  onChange={(event) =>
                    setState(
                      event.target.value
                    )
                  }
                  placeholder="SP"
                  fullWidth
                  disabled={
                    isSaving
                  }
                  slotProps={{
                    htmlInput: {
                      maxLength: 2,
                    },
                  }}
                />

                <TextField
                  label="CEP"
                  value={zipCode}
                  onChange={(event) =>
                    setZipCode(
                      event.target.value
                    )
                  }
                  fullWidth
                  disabled={
                    isSaving
                  }
                />
              </Stack>

              <Stack
                direction={{
                  xs: "column",
                  md: "row",
                }}
                spacing={2}
              >
                <TextField
                  label="Telefone"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value
                    )
                  }
                  fullWidth
                  disabled={
                    isSaving
                  }
                />

                <TextField
                  label="E-mail"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  fullWidth
                  disabled={
                    isSaving
                  }
                />
              </Stack>

              <TextField
                label="Gerente responsável"
                value={manager}
                onChange={(event) =>
                  setManager(
                    event.target.value
                  )
                }
                fullWidth
                disabled={
                  isSaving
                }
              />

              <TextField
                label="Observações"
                value={notes}
                onChange={(event) =>
                  setNotes(
                    event.target.value
                  )
                }
                multiline
                rows={5}
                fullWidth
                disabled={
                  isSaving
                }
              />

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={2}
                justifyContent="flex-end"
              >
                <Button
                  variant="outlined"
                  startIcon={
                    <ArrowBack />
                  }
                  onClick={
                    handleBack
                  }
                  disabled={
                    isSaving
                  }
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={
                    <Save />
                  }
                  loading={
                    isSaving
                  }
                  disabled={
                    isSaving ||
                    !code.trim() ||
                    !name.trim()
                  }
                >
                  {isSaving
                    ? "Salvando..."
                    : "Salvar loja"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </MainLayout>
  );
}

export default CreateStorePage;