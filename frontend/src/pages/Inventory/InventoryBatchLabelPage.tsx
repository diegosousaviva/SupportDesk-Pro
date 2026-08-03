import {
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  GlobalStyles,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  PictureAsPdfOutlined,
  PrintOutlined,
} from "@mui/icons-material";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import InventoryLabelPreview from "../../components/inventory/InventoryLabelPreview";
import MainLayout from "../../components/layout/MainLayout";

import {
  getInventoryItems,
} from "../../services/inventoryService";

import {
  getStoreById,
} from "../../services/storeService";

import {
  DEFAULT_INVENTORY_LABEL_OPTIONS,
} from "../../types/InventoryLabel";

import type {
  InventoryLabelOptions,
} from "../../types/InventoryLabel";

function parseSelectedIds(
  rawIds: string | null
): number[] {
  if (!rawIds) {
    return [];
  }

  return Array.from(
    new Set(
      rawIds
        .split(",")
        .map((value) =>
          Number(
            value.trim()
          )
        )
        .filter(
          (value) =>
            Number.isInteger(
              value
            ) &&
            value > 0
        )
    )
  );
}

function InventoryBatchLabelPage() {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();

  const [
    options,
    setOptions,
  ] =
    useState<InventoryLabelOptions>(
      DEFAULT_INVENTORY_LABEL_OPTIONS
    );

  const selectedIds =
    useMemo(
      () =>
        parseSelectedIds(
          searchParams.get(
            "ids"
          )
        ),
      [
        searchParams,
      ]
    );

  const selectedItems =
    useMemo(() => {
      const inventoryItems =
        getInventoryItems();

      return selectedIds
        .map((selectedId) =>
          inventoryItems.find(
            (item) =>
              item.id ===
              selectedId
          )
        )
        .filter(
          (
            item
          ): item is NonNullable<
            typeof item
          > =>
            Boolean(item)
        );
    }, [
      selectedIds,
    ]);

  function updateOption<
    Key extends keyof InventoryLabelOptions,
  >(
    field: Key,
    value:
      InventoryLabelOptions[Key]
  ): void {
    setOptions(
      (
        currentOptions
      ) => ({
        ...currentOptions,

        [field]:
          value,
      })
    );
  }

  function handlePrint():
    void {
    window.print();
  }

  function handleBack():
    void {
    navigate(
      "/inventory"
    );
  }

  if (
    selectedItems.length ===
    0
  ) {
    return (
      <MainLayout title="Etiquetas em lote">
        <Stack spacing={2}>
          <Alert severity="warning">
            Nenhum equipamento válido foi selecionado para impressão.
          </Alert>

          <Box>
            <Button
              variant="outlined"
              startIcon={
                <ArrowBack />
              }
              onClick={
                handleBack
              }
            >
              Voltar para inventário
            </Button>
          </Box>
        </Stack>
      </MainLayout>
    );
  }

  return (
    <>
      <GlobalStyles
        styles={{
          "@media print": {
            "@page": {
              margin: "8mm",
              size: "auto",
            },

            "html, body": {
              margin:
                "0 !important",

              padding:
                "0 !important",

              width:
                "100%",

              minHeight:
                "0 !important",

              background:
                "#ffffff !important",
            },

            "body *": {
              visibility:
                "hidden !important",
            },

            "#inventory-batch-label-print-area":
              {
                visibility:
                  "visible !important",

                position:
                  "absolute",

                top: 0,

                left: 0,

                width:
                  "100%",

                margin:
                  "0 !important",

                padding:
                  "0 !important",

                display:
                  "grid",

                gridTemplateColumns:
                  "repeat(2, max-content)",

                gap:
                  "8mm",

                justifyContent:
                  "center",

                alignItems:
                  "start",

                background:
                  "#ffffff !important",
              },

            "#inventory-batch-label-print-area *":
              {
                visibility:
                  "visible !important",
              },

            ".inventory-batch-label-item":
              {
                breakInside:
                  "avoid",

                pageBreakInside:
                  "avoid",

                margin:
                  "0 !important",
              },

            ".inventory-batch-label-item #inventory-label-preview":
              {
                margin:
                  "0 !important",

                boxShadow:
                  "none !important",

                breakInside:
                  "avoid",

                pageBreakInside:
                  "avoid",
              },

            ".inventory-batch-screen-only":
              {
                display:
                  "none !important",
              },
          },
        }}
      />

      <MainLayout title="Etiquetas em lote">
        <Stack spacing={3}>
          <Box
            className="inventory-batch-screen-only"
          >
            <Button
              variant="text"
              startIcon={
                <ArrowBack />
              }
              onClick={
                handleBack
              }
              sx={{
                mb: 1,
              }}
            >
              Voltar para inventário
            </Button>

            <Typography
              variant="h4"
              component="h1"
              fontWeight={700}
            >
              Impressão de etiquetas em lote
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              Configure o modelo e imprima as etiquetas dos equipamentos selecionados.
            </Typography>
          </Box>

          <Stack
            direction={{
              xs: "column",
              lg: "row",
            }}
            spacing={3}
            alignItems="flex-start"
          >
            <Paper
              className="inventory-batch-screen-only"
              variant="outlined"
              sx={{
                p: 3,

                width: {
                  xs: "100%",
                  lg: 360,
                },

                flexShrink: 0,
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    Configurações
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                    }}
                  >
                    {selectedItems.length}{" "}
                    equipamento
                    {selectedItems.length ===
                    1
                      ? ""
                      : "s"}{" "}
                    selecionado
                    {selectedItems.length ===
                    1
                      ? ""
                      : "s"}.
                  </Typography>
                </Box>

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
                  fullWidth
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
                  size="large"
                  startIcon={
                    <PrintOutlined />
                  }
                  onClick={
                    handlePrint
                  }
                >
                  Imprimir{" "}
                  {selectedItems.length}{" "}
                  etiqueta
                  {selectedItems.length ===
                  1
                    ? ""
                    : "s"}
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={
                    <PictureAsPdfOutlined />
                  }
                  onClick={
                    handlePrint
                  }
                >
                  Baixar PDF
                </Button>

                <Alert severity="info">
                  Para gerar o PDF, clique em
                  <strong>
                    {" "}Baixar PDF
                  </strong>{" "}
                  e selecione
                  <strong>
                    {" "}Salvar como PDF
                  </strong>{" "}
                  na janela de impressão.
                </Alert>
              </Stack>
            </Paper>

            <Box
              id="inventory-batch-label-print-area"
              sx={{
                flex: 1,

                width: "100%",

                display: "grid",

                gridTemplateColumns: {
                  xs:
                    "minmax(0, 1fr)",

                  md:
                    options.size ===
                    "Completa"
                      ? "minmax(0, 1fr)"
                      : "repeat(2, minmax(0, 1fr))",
                },

                gap: 3,

                alignItems:
                  "start",

                justifyItems:
                  "center",
              }}
            >
              {selectedItems.map(
                (item) => {
                  const store =
                    getStoreById(
                      item.storeId
                    );

                  return (
                    <Box
                      key={
                        item.id
                      }
                      className="inventory-batch-label-item"
                      sx={{
                        width:
                          "100%",

                        display:
                          "flex",

                        justifyContent:
                          "center",
                      }}
                    >
                      <InventoryLabelPreview
                        item={
                          item
                        }
                        store={
                          store
                        }
                        options={
                          options
                        }
                      />
                    </Box>
                  );
                }
              )}
            </Box>
          </Stack>
        </Stack>
      </MainLayout>
    </>
  );
}

export default InventoryBatchLabelPage;