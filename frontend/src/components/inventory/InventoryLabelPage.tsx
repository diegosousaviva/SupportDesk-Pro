import {
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  Switch,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  PrintOutlined,
} from "@mui/icons-material";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";
import InventoryLabelPreview from "../../components/inventory/InventoryLabelPreview";

import {
  DEFAULT_INVENTORY_LABEL_OPTIONS,
  type InventoryLabelOptions,
} from "../../types/InventoryLabel";

import {
  getInventoryItemById,
} from "../../services/inventoryService";

import {
  getStoreById,
} from "../../services/storeService";

function InventoryLabelPage() {
  const navigate =
    useNavigate();

  const { id } =
    useParams();

  const equipment =
    getInventoryItemById(
      Number(id)
    );

  if (!equipment) {
    return (
      <MainLayout title="Etiqueta">
        <Alert severity="error">
          Equipamento não encontrado.
        </Alert>

        <Button
          sx={{ mt: 2 }}
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() =>
            navigate("/inventory")
          }
        >
          Voltar
        </Button>
      </MainLayout>
    );
  }

  const store =
    getStoreById(
      equipment.storeId
    );

  const [
    options,
    setOptions,
  ] =
    useState<InventoryLabelOptions>(
      DEFAULT_INVENTORY_LABEL_OPTIONS
    );

  function updateOption<
    K extends keyof InventoryLabelOptions
  >(
    field: K,
    value: InventoryLabelOptions[K]
  ) {
    setOptions(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  function handlePrint() {
    window.print();
  }

  return (
    <MainLayout title="Etiqueta">
      <Stack spacing={3}>
        <Box>
          <Button
            variant="text"
            startIcon={<ArrowBack />}
            onClick={() =>
              navigate(
                `/inventory/${equipment.id}`
              )
            }
          >
            Voltar
          </Button>

          <Typography
            variant="h4"
            fontWeight={700}
          >
            Etiqueta do equipamento
          </Typography>

          <Typography
            color="text.secondary"
          >
            Escolha o modelo da etiqueta antes da impressão.
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: "column",
            lg: "row",
          }}
          spacing={3}
        >
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              width: {
                lg: 360,
              },
            }}
          >
            <Stack spacing={2}>
              <Typography
                variant="h6"
              >
                Configurações
              </Typography>

              <TextField
                select
                label="Modelo"
                value={
                  options.size
                }
                onChange={(
                  event
                ) =>
                  updateOption(
                    "size",
                    event.target
                      .value as InventoryLabelOptions["size"]
                  )
                }
              >
                <MenuItem value="Pequena">
                  Pequena
                </MenuItem>

                <MenuItem value="Média">
                  Média
                </MenuItem>

                <MenuItem value="Completa">
                  Completa
                </MenuItem>
              </TextField>

              <FormControlLabel
                control={
                  <Switch
                    checked={
                      options.showAssetNumber
                    }
                    onChange={(
                      event
                    ) =>
                      updateOption(
                        "showAssetNumber",
                        event.target.checked
                      )
                    }
                  />
                }
                label="Mostrar patrimônio"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={
                      options.showDescription
                    }
                    onChange={(
                      event
                    ) =>
                      updateOption(
                        "showDescription",
                        event.target.checked
                      )
                    }
                  />
                }
                label="Mostrar descrição"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={
                      options.showStore
                    }
                    onChange={(
                      event
                    ) =>
                      updateOption(
                        "showStore",
                        event.target.checked
                      )
                    }
                  />
                }
                label="Mostrar loja"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={
                      options.showQrCode
                    }
                    onChange={(
                      event
                    ) =>
                      updateOption(
                        "showQrCode",
                        event.target.checked
                      )
                    }
                  />
                }
                label="Mostrar QR Code"
              />

              <Button
                variant="contained"
                startIcon={
                  <PrintOutlined />
                }
                onClick={
                  handlePrint
                }
              >
                Imprimir etiqueta
              </Button>
            </Stack>
          </Paper>

          <Box
            flex={1}
            display="flex"
            justifyContent="center"
            alignItems="flex-start"
          >
            <InventoryLabelPreview
              item={
                equipment
              }
              store={
                store
              }
              options={
                options
              }
            />
          </Box>
        </Stack>
      </Stack>
    </MainLayout>
  );
}

export default InventoryLabelPage;