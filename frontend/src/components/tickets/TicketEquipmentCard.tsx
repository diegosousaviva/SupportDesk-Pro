import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

import {
  Inventory2Outlined,
  OpenInNewOutlined,
} from "@mui/icons-material";

import {
  useNavigate,
} from "react-router-dom";

import InfoCard from "../common/InfoCard";

import {
  getInventoryItemById,
} from "../../services/inventoryService";

import {
  getStoreById,
} from "../../services/storeService";

import type {
  InventoryCondition,
  InventoryStatus,
} from "../../types/InventoryItem";

import type {
  Ticket,
} from "../../types/Ticket";

interface TicketEquipmentCardProps {
  ticket: Ticket;
}

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

function getStatusColor(
  status: InventoryStatus
): ChipColor {
  switch (status) {
    case "Em uso":
      return "success";

    case "Em estoque":
      return "info";

    case "Em manutenção":
      return "warning";

    case "Emprestado":
      return "secondary";

    case "Reserva":
      return "primary";

    case "Baixado":
      return "error";

    case "Descartado":
    default:
      return "default";
  }
}

function getConditionColor(
  condition: InventoryCondition
): ChipColor {
  switch (condition) {
    case "Novo":
      return "primary";

    case "Excelente":
      return "success";

    case "Bom":
      return "info";

    case "Regular":
      return "warning";

    case "Ruim":
      return "error";

    case "Sucata":
    default:
      return "default";
  }
}

function TicketEquipmentCard({
  ticket,
}: TicketEquipmentCardProps) {
  const navigate =
    useNavigate();

  if (
    ticket.inventoryItemId ===
    null
  ) {
    return (
      <InfoCard
        title="Equipamento relacionado"
        icon={
          <Inventory2Outlined color="primary" />
        }
      >
        <Alert severity="info">
          Este chamado não possui equipamento vinculado.
        </Alert>
      </InfoCard>
    );
  }

  const inventoryItem =
    getInventoryItemById(
      ticket.inventoryItemId
    );

  if (!inventoryItem) {
    return (
      <InfoCard
        title="Equipamento relacionado"
        icon={
          <Inventory2Outlined color="primary" />
        }
      >
        <Alert severity="warning">
          O equipamento vinculado a este chamado não foi
          encontrado no inventário.
        </Alert>
      </InfoCard>
    );
  }

  const inventoryItemId =
    inventoryItem.id;

  const store =
    getStoreById(
      inventoryItem.storeId
    );

  function handleOpenEquipment(): void {
    navigate(
      `/inventory/${inventoryItemId}`
    );
  }

  return (
    <InfoCard
      title="Equipamento relacionado"
      icon={
        <Inventory2Outlined color="primary" />
      }
      actions={
        <Button
          variant="outlined"
          size="small"
          startIcon={
            <OpenInNewOutlined />
          }
          onClick={
            handleOpenEquipment
          }
        >
          Abrir equipamento
        </Button>
      }
    >
      <Stack spacing={3}>
        <Box>
          <Typography
            variant="h6"
            fontWeight={700}
          >
            {inventoryItem.description}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Equipamento do inventário #
            {inventoryItem.id}
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={4}
        >
          <Box flex={1}>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Etiqueta
            </Typography>

            <Typography
              fontWeight={700}
            >
              {inventoryItem.tag}
            </Typography>
          </Box>

          <Box flex={1}>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Patrimônio
            </Typography>

            <Typography>
              {inventoryItem.assetNumber ||
                "Não informado"}
            </Typography>
          </Box>

          <Box flex={1}>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Categoria
            </Typography>

            <Typography>
              {inventoryItem.category}
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={4}
        >
          <Box flex={1}>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Loja
            </Typography>

            <Typography>
              {store
                ? `${store.code} — ${store.name}`
                : "Loja não encontrada"}
            </Typography>
          </Box>

          <Box flex={1}>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Localização
            </Typography>

            <Typography>
              {inventoryItem.location ||
                "Não informada"}
            </Typography>
          </Box>

          <Box flex={1}>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Fabricante e modelo
            </Typography>

            <Typography>
              {[
                inventoryItem.manufacturer,
                inventoryItem.model,
              ]
                .filter(Boolean)
                .join(" ") ||
                "Não informado"}
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={2}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 0.5,
              }}
            >
              Situação
            </Typography>

            <Chip
              size="small"
              label={
                inventoryItem.status
              }
              color={getStatusColor(
                inventoryItem.status
              )}
            />
          </Box>

          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 0.5,
              }}
            >
              Estado físico
            </Typography>

            <Chip
              size="small"
              label={
                inventoryItem.condition
              }
              color={getConditionColor(
                inventoryItem.condition
              )}
              variant="outlined"
            />
          </Box>
        </Stack>
      </Stack>
    </InfoCard>
  );
}

export default TicketEquipmentCard;