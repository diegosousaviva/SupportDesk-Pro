import {
  useRef,
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
  useParams,
} from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";

import InventoryLabelPreview from "../../components/inventory/InventoryLabelPreview";

import {
  useAuth,
} from "../../contexts/AuthContext";

import {
  addInventoryHistoryEvent,
} from "../../services/inventoryHistoryService";

import {
  getInventoryItemById,
} from "../../services/inventoryService";

import {
  getStoreById,
} from "../../services/storeService";

import {
  getUserById,
} from "../../services/userService";

import {
  DEFAULT_INVENTORY_LABEL_OPTIONS,
} from "../../types/InventoryLabel";

import type {
  InventoryLabelOptions,
} from "../../types/InventoryLabel";

function InventoryLabelPage() {
  const navigate =
    useNavigate();

  const {
    user,
  } = useAuth();

  const {
    id,
  } = useParams();

  const equipment =
    getInventoryItemById(
      Number(id)
    );

  const [
    options,
    setOptions,
  ] =
    useState<InventoryLabelOptions>(
      DEFAULT_INVENTORY_LABEL_OPTIONS
    );

  const lastActionRef =
    useRef<{
      action: "print" | "pdf";
      timestamp: number;
    } | null>(null);

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

  function getValidPerformedByUserId():
    number | null {
    if (
      !user?.id
    ) {
      return null;
    }

    const registeredUser =
      getUserById(
        user.id
      );

    return registeredUser
      ? registeredUser.id
      : null;
  }

  function registerLabelAction(
    action: "print" | "pdf"
  ): void {
    if (!equipment) {
      return;
    }

    const currentTimestamp =
      Date.now();

    const lastAction =
      lastActionRef.current;

    const isDuplicateAction =
      lastAction?.action ===
        action &&
      currentTimestamp -
        lastAction.timestamp <
        1500;

    if (isDuplicateAction) {
      return;
    }

    lastActionRef.current = {
      action,
      timestamp:
        currentTimestamp,
    };

    const createdEvent =
      addInventoryHistoryEvent({
        inventoryItemId:
          equipment.id,

        type:
          "Impressão de etiqueta",

        title:
          action === "pdf"
            ? "Etiqueta exportada para PDF"
            : "Etiqueta enviada para impressão",

        description:
          action === "pdf"
            ? `A etiqueta foi preparada para exportação em PDF utilizando o modelo "${options.size}".`
            : `A etiqueta foi enviada para impressão utilizando o modelo "${options.size}".`,

        performedByUserId:
          getValidPerformedByUserId(),
      });

    console.info(
      "Evento de etiqueta registrado no histórico:",
      createdEvent
    );
  }

  function handlePrint():
    void {
    try {
      registerLabelAction(
        "print"
      );
    } catch (historyError) {
      console.error(
        "Não foi possível registrar a impressão no histórico.",
        historyError
      );
    }

    window.print();
  }

  function handleDownloadPdf():
    void {
    try {
      registerLabelAction(
        "pdf"
      );
    } catch (historyError) {
      console.error(
        "Não foi possível registrar a exportação para PDF no histórico.",
        historyError
      );
    }

    window.print();
  }

  if (!equipment) {
    return (
      <MainLayout title="Etiqueta">
        <Alert severity="error">
          Equipamento não encontrado.
        </Alert>

        <Button
          sx={{
            mt: 2,
          }}
          variant="outlined"
          startIcon={
            <ArrowBack />
          }
          onClick={() =>
            navigate(
              "/inventory"
            )
          }
        >
          Voltar para inventário
        </Button>
      </MainLayout>
    );
  }

  const store =
    getStoreById(
      equipment.storeId
    );

  return (
    <>
      <GlobalStyles
        styles={{
          "@media print": {
            "@page": {
              margin: 0,
              size: "auto",
            },

            "html, body": {
              margin: "0 !important",
              padding: "0 !important",
              width: "100%",
              minHeight:
                "0 !important",
              background:
                "#ffffff !important",
            },

            "body *": {
              visibility:
                "hidden !important",
            },

            "#inventory-label-print-area":
              {
                visibility:
                  "visible !important",

                position:
                  "absolute",

                top: 0,

                left: 0,

                width: "100%",

                minHeight: 0,

                margin:
                  "0 !important",

                padding:
                  "10mm !important",

                display:
                  "flex",

                alignItems:
                  "flex-start",

                justifyContent:
                  "center",

                background:
                  "#ffffff !important",
              },

            "#inventory-label-print-area *":
              {
                visibility:
                  "visible !important",
              },

            "#inventory-label-preview":
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

            ".inventory-label-screen-only":
              {
                display:
                  "none !important",
              },
          },
        }}
      />

      <MainLayout title="Etiqueta">
        <Stack spacing={3}>
          <Box
            className="inventory-label-screen-only"
          >
            <Button
              variant="text"
              startIcon={
                <ArrowBack />
              }
              onClick={() =>
                navigate(
                  `/inventory/${equipment.id}`
                )
              }
              sx={{
                mb: 1,
              }}
            >
              Voltar
            </Button>

            <Typography
              variant="h4"
              component="h1"
              fontWeight={700}
            >
              Impressão de etiqueta
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              Configure o modelo antes da impressão ou exportação.
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
              className="inventory-label-screen-only"
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
                <Typography
                  variant="h6"
                  fontWeight={700}
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
                  Imprimir etiqueta
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={
                    <PictureAsPdfOutlined />
                  }
                  onClick={
                    handleDownloadPdf
                  }
                >
                  Baixar PDF
                </Button>

                <Alert severity="info">
                  Ao clicar em
                  <strong>
                    {" "}Baixar PDF
                  </strong>
                  , selecione
                  <strong>
                    {" "}Salvar como PDF
                  </strong>
                  no campo de destino da janela de impressão.
                </Alert>
              </Stack>
            </Paper>

            <Box
              id="inventory-label-print-area"
              sx={{
                flex: 1,

                width: "100%",

                display:
                  "flex",

                justifyContent:
                  "center",

                alignItems:
                  "flex-start",

                py: {
                  xs: 2,
                  lg: 0,
                },
              }}
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
    </>
  );
}

export default InventoryLabelPage;