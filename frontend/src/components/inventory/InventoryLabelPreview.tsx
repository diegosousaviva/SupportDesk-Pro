import {
  Box,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  Inventory2Outlined,
} from "@mui/icons-material";

import {
  QRCodeSVG,
} from "qrcode.react";

import type {
  InventoryItem,
} from "../../types/InventoryItem";

import type {
  InventoryLabelOptions,
} from "../../types/InventoryLabel";

import type {
  Store,
} from "../../types/Store";

interface InventoryLabelPreviewProps {
  item: InventoryItem;

  store?: Store;

  options: InventoryLabelOptions;
}

function getLabelDimensions(
  size: InventoryLabelOptions["size"]
) {
  switch (size) {
    case "Pequena":
      return {
        width: 240,
        minHeight: 120,
        padding: 2,
      };

    case "Média":
      return {
        width: 340,
        minHeight: 210,
        padding: 2.5,
      };

    case "Completa":
      return {
        width: 440,
        minHeight: 320,
        padding: 3,
      };
  }
}

function getQrCodeSize(
  size: InventoryLabelOptions["size"]
): number {
  switch (size) {
    case "Pequena":
      return 64;

    case "Média":
      return 96;

    case "Completa":
      return 120;
  }
}

function getEquipmentUrl(
  itemId: number
): string {
  if (
    typeof window ===
    "undefined"
  ) {
    return `/inventory/${itemId}`;
  }

  return `${window.location.origin}/inventory/${itemId}`;
}

function InventoryLabelPreview({
  item,
  store,
  options,
}: InventoryLabelPreviewProps) {
  const dimensions =
    getLabelDimensions(
      options.size
    );

  const qrCodeSize =
    getQrCodeSize(
      options.size
    );

  const equipmentUrl =
    getEquipmentUrl(
      item.id
    );

  const isSmall =
    options.size ===
    "Pequena";

  const isComplete =
    options.size ===
    "Completa";

  return (
    <Paper
      id="inventory-label-preview"
      variant="outlined"
      sx={{
        width: "100%",
        maxWidth:
          dimensions.width,
        minHeight:
          dimensions.minHeight,
        p:
          dimensions.padding,
        mx: "auto",
        border: "2px solid",
        borderColor:
          "common.black",
        borderRadius: 1,
        backgroundColor:
          "common.white",
        color:
          "common.black",
        overflow:
          "hidden",

        "& *": {
          color:
            "common.black",
        },
      }}
    >
      <Stack
        spacing={
          isSmall
            ? 1
            : 1.5
        }
        height="100%"
      >
        {!isSmall && (
          <>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="center"
            >
              <Inventory2Outlined
                fontSize="small"
              />

              <Typography
                variant="subtitle2"
                fontWeight={900}
                letterSpacing={0.8}
              >
                SUPPORTDESK PRO
              </Typography>
            </Stack>

            <Divider
              sx={{
                borderColor:
                  "common.black",
              }}
            />
          </>
        )}

        <Stack
          direction={
            isSmall
              ? "row"
              : "column"
          }
          spacing={
            isSmall
              ? 2
              : 1
          }
          alignItems={
            isSmall
              ? "center"
              : "stretch"
          }
          justifyContent="space-between"
          flex={1}
        >
          <Stack
            spacing={
              isSmall
                ? 0.25
                : 0.75
            }
            flex={1}
            minWidth={0}
          >
            <Typography
              variant={
                isSmall
                  ? "caption"
                  : "body2"
              }
            >
              Etiqueta
            </Typography>

            <Typography
              variant={
                isSmall
                  ? "h6"
                  : "h5"
              }
              fontWeight={900}
              noWrap
            >
              {item.tag}
            </Typography>

            {options.showAssetNumber &&
              item.assetNumber && (
                <Box>
                  <Typography
                    variant="caption"
                  >
                    Patrimônio
                  </Typography>

                  <Typography
                    variant="body2"
                    fontWeight={700}
                    noWrap
                  >
                    {
                      item.assetNumber
                    }
                  </Typography>
                </Box>
              )}

            {!isSmall &&
              options.showDescription && (
                <Box>
                  <Typography
                    variant="caption"
                  >
                    Equipamento
                  </Typography>

                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{
                      overflow:
                        "hidden",

                      textOverflow:
                        "ellipsis",

                      display:
                        "-webkit-box",

                      WebkitLineClamp:
                        isComplete
                          ? 2
                          : 1,

                      WebkitBoxOrient:
                        "vertical",
                    }}
                  >
                    {
                      item.description
                    }
                  </Typography>
                </Box>
              )}

            {isComplete &&
              options.showStore && (
                <Box>
                  <Typography
                    variant="caption"
                  >
                    Loja
                  </Typography>

                  <Typography
                    variant="body2"
                    fontWeight={700}
                  >
                    {store
                      ? `${store.code} — ${store.name}`
                      : "Loja não encontrada"}
                  </Typography>
                </Box>
              )}

            {isComplete && (
              <Box>
                <Typography
                  variant="caption"
                >
                  Localização
                </Typography>

                <Typography
                  variant="body2"
                  fontWeight={700}
                >
                  {
                    item.location
                  }
                </Typography>
              </Box>
            )}
          </Stack>

          {options.showQrCode && (
            <Box
              sx={{
                flexShrink: 0,
                alignSelf:
                  "center",
                p: 0.75,
                border:
                  "1px solid",
                borderColor:
                  "common.black",
                backgroundColor:
                  "common.white",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
              }}
            >
              <QRCodeSVG
                value={
                  equipmentUrl
                }
                size={
                  qrCodeSize
                }
                level="M"
                marginSize={0}
                bgColor="#FFFFFF"
                fgColor="#000000"
                title={`Abrir equipamento ${item.tag}`}
              />
            </Box>
          )}
        </Stack>

        {!isSmall && (
          <>
            <Divider
              sx={{
                borderColor:
                  "common.black",
              }}
            />

            <Stack
              spacing={0.25}
              alignItems="center"
            >
              <Typography
                variant="caption"
                textAlign="center"
                fontSize="0.625rem"
                fontWeight={700}
              >
                Identificação de ativo de TI
              </Typography>

              {options.showQrCode && (
                <Typography
                  variant="caption"
                  textAlign="center"
                  fontSize="0.55rem"
                  sx={{
                    wordBreak:
                      "break-all",
                  }}
                >
                  Escaneie para abrir o equipamento
                </Typography>
              )}
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
}

export default InventoryLabelPreview;