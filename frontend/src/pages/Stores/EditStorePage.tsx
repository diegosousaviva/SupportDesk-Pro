import {
  useState,
} from "react";

import {
  useNavigate,
  useParams,
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
  getStoreById,
  updateStore,
} from "../../services/storeService";

import type {
  StoreStatus,
} from "../../types/Store";

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
    Number(id);

  const store =
    getStoreById(
      storeId
    );

  const [
    code,
    setCode,
  ] = useState(
    store?.code ?? ""
  );

  const [
    name,
    setName,
  ] = useState(
    store?.name ?? ""
  );

  const [
    status,
    setStatus,
  ] = useState<StoreStatus>(
    store?.status ?? "Ativa"
  );

  const [
    address,
    setAddress,
  ] = useState(
    store?.address ?? ""
  );

  const [
    city,
    setCity,
  ] = useState(
    store?.city ?? ""
  );

  const [
    state,
    setState,
  ] = useState(
    store?.state ?? ""
  );

  const [
    zipCode,
    setZipCode,
  ] = useState(
    store?.zipCode ?? ""
  );

  const [
    phone,
    setPhone,
  ] = useState(
    store?.phone ?? ""
  );

  const [
    email,
    setEmail,
  ] = useState(
    store?.email ?? ""
  );

  const [
    manager,
    setManager,
  ] = useState(
    store?.manager ?? ""
  );

  const [
    notes,
    setNotes,
  ] = useState(
    store?.notes ?? ""
  );

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

    if (store) {
      navigate(
        `/stores/${store.id}`
      );

      return;
    }

    navigate(
      "/stores"
    );
  }

  function handleSave(): void {
    if (!store) {
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
          {
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
          }
        );

      if (!updatedStore) {
        throw new Error(
          "A loja não foi encontrada."
        );
      }

      showSnackbar(
        "Loja atualizada com sucesso.",
        {
          severity: "success",
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
          severity: "error",
        }
      );
    } finally {
      setIsSaving(
        false
      );
    }
  }

  if (!store) {
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
            mt: 2,
          }}
        >
          Voltar para lojas
        </Button>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Editar Loja">
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
          Voltar aos detalhes
        </Button>

        <Typography
          variant="h4"
          component="h1"
          fontWeight={700}
          sx={{
            mb: 1,
          }}
        >
          Editar loja
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mb: 3,
          }}
        >
          Atualize as informações da unidade.
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
                variant="contained"
                startIcon={
                  <Save />
                }
                onClick={
                  handleSave
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
                  : "Salvar alterações"}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </MainLayout>
  );
}

export default EditStorePage;