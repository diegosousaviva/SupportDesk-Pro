import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  BusinessOutlined,
  CalendarMonthOutlined,
  EditOutlined,
  PersonOutline,
  PrintOutlined,
} from "@mui/icons-material";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Permissions,
} from "../../auth/permissions";

import {
  Timeline,
} from "../../components/timeline";

import {
  inventoryTimelineFilters,
  mapInventoryHistoryToTimeline,
} from "../../components/inventory/inventoryHistoryTimelineMapper";

import MainLayout from "../../components/layout/MainLayout";

import {
  usePermissions,
} from "../../hooks/usePermissions";

import {
  getInventoryHistory,
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

import type {
  InventoryCondition,
  InventoryStatus,
} from "../../types/InventoryItem";

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

    case "Descartado":
      return "default";

    case "Baixado":
      return "error";
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
      return "default";
  }
}

function formatDate(
  value: string
): string {
  if (!value) {
    return "Não informado";
  }

  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  const date =
    new Date(
      year,
      month - 1,
      day
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Data inválida";
  }

  return date.toLocaleDateString(
    "pt-BR"
  );
}

function formatCurrency(
  value: number
): string {
  return value.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}

function InventoryDetailsPage() {
  const navigate =
    useNavigate();

  const {
    id,
  } = useParams();

  const {
    can,
  } = usePermissions();

  const equipment =
    getInventoryItemById(
      Number(id)
    );

  if (!equipment) {
    return (
      <MainLayout title="Equipamento">
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

  const responsible =
    equipment.responsibleUserId ===
    null
      ? null
      : getUserById(
          equipment.responsibleUserId
        );

  const historyEvents =
    getInventoryHistory(
      equipment.id
    );

    const timelineEvents =
  mapInventoryHistoryToTimeline(
    historyEvents
  );

  return (
    <MainLayout title="Equipamento">
      <Stack spacing={3}>
        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            md: "center",
          }}
        >
          <Box>
            <Button
              variant="text"
              startIcon={
                <ArrowBack />
              }
              onClick={() =>
                navigate(
                  "/inventory"
                )
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
              {equipment.description}
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              Etiqueta:{" "}
              <strong>
                {equipment.tag}
              </strong>
            </Typography>
          </Box>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1}
            width={{
              xs: "100%",
              md: "auto",
            }}
          >
            <Chip
              color={
                getStatusColor(
                  equipment.status
                )
              }
              label={
                equipment.status
              }
            />

            <Chip
              color={
                getConditionColor(
                  equipment.condition
                )
              }
              label={`Estado: ${equipment.condition}`}
              variant="outlined"
            />

            <Button
              variant="outlined"
              startIcon={
                <PrintOutlined />
              }
              onClick={() =>
                navigate(
                  `/inventory/${equipment.id}/label`
                )
              }
            >
              Imprimir etiqueta
            </Button>

            {can(
              Permissions.inventory.edit
            ) && (
              <Button
                variant="contained"
                startIcon={
                  <EditOutlined />
                }
                onClick={() =>
                  navigate(
                    `/inventory/${equipment.id}/edit`
                  )
                }
              >
                Editar
              </Button>
            )}
          </Stack>
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            p: {
              xs: 2.5,
              md: 3,
            },
          }}
        >
          <Stack spacing={2}>
            <Typography
              variant="h6"
              fontWeight={700}
            >
              Identificação
            </Typography>

            <Divider />

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
                  {equipment.tag}
                </Typography>
              </Box>

              <Box flex={1}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Origem da etiqueta
                </Typography>

                <Typography
                  fontWeight={700}
                >
                  {equipment.tagMode}
                </Typography>
              </Box>

              <Box flex={1}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Patrimônio
                </Typography>

                <Typography
                  fontWeight={700}
                >
                  {equipment.assetNumber ||
                    "Não informado"}
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
                  Categoria
                </Typography>

                <Typography>
                  {equipment.category}
                </Typography>
              </Box>

              <Box flex={1}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Situação
                </Typography>

                <Chip
                  size="small"
                  color={
                    getStatusColor(
                      equipment.status
                    )
                  }
                  label={
                    equipment.status
                  }
                  sx={{
                    mt: 0.5,
                  }}
                />
              </Box>

              <Box flex={1}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Estado físico
                </Typography>

                <Chip
                  size="small"
                  color={
                    getConditionColor(
                      equipment.condition
                    )
                  }
                  label={
                    equipment.condition
                  }
                  variant="outlined"
                  sx={{
                    mt: 0.5,
                  }}
                />
              </Box>
            </Stack>
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: {
              xs: 2.5,
              md: 3,
            },
          }}
        >
          <Stack spacing={2}>
            <Typography
              variant="h6"
              fontWeight={700}
            >
              Informações do equipamento
            </Typography>

            <Divider />

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
                  Fabricante
                </Typography>

                <Typography>
                  {equipment.manufacturer ||
                    "Não informado"}
                </Typography>
              </Box>

              <Box flex={1}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Modelo
                </Typography>

                <Typography>
                  {equipment.model ||
                    "Não informado"}
                </Typography>
              </Box>

              <Box flex={1}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Número de série
                </Typography>

                <Typography>
                  {equipment.serialNumber ||
                    "Não informado"}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: {
              xs: 2.5,
              md: 3,
            },
          }}
        >
          <Stack spacing={2}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <BusinessOutlined
                color="primary"
              />

              <Typography
                variant="h6"
                fontWeight={700}
              >
                Localização
              </Typography>
            </Stack>

            <Divider />

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

                <Typography
                  fontWeight={700}
                >
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
                  Localização interna
                </Typography>

                <Typography>
                  {equipment.location}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: {
              xs: 2.5,
              md: 3,
            },
          }}
        >
          <Stack spacing={2}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <PersonOutline
                color="primary"
              />

              <Typography
                variant="h6"
                fontWeight={700}
              >
                Responsável
              </Typography>
            </Stack>

            <Divider />

            <Typography>
              {responsible?.name ??
                "Sem responsável"}
            </Typography>

            {responsible && (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {responsible.email}
              </Typography>
            )}
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: {
              xs: 2.5,
              md: 3,
            },
          }}
        >
          <Stack spacing={2}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <CalendarMonthOutlined
                color="primary"
              />

              <Typography
                variant="h6"
                fontWeight={700}
              >
                Aquisição e garantia
              </Typography>
            </Stack>

            <Divider />

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
                  Valor do equipamento
                </Typography>

                <Typography
                  fontWeight={700}
                >
                  {formatCurrency(
                    equipment.value
                  )}
                </Typography>
              </Box>

              <Box flex={1}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Data de aquisição
                </Typography>

                <Typography>
                  {formatDate(
                    equipment.acquisitionDate
                  )}
                </Typography>
              </Box>

              <Box flex={1}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Garantia até
                </Typography>

                <Typography>
                  {formatDate(
                    equipment.warrantyUntil
                  )}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: {
              xs: 2.5,
              md: 3,
            },
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              mb: 2,
            }}
          >
            Observações
          </Typography>

          <Typography
            color={
              equipment.notes
                ? "text.primary"
                : "text.secondary"
            }
            sx={{
              whiteSpace: "pre-wrap",
            }}
          >
            {equipment.notes ||
              "Nenhuma observação cadastrada."}
          </Typography>
        </Paper>

        <Timeline
  title="Histórico do equipamento"
  subtitle="Acompanhe todas as alterações realizadas neste ativo."
  events={timelineEvents}
  filterOptions={
    inventoryTimelineFilters
  }
/>

        <Typography
          variant="caption"
          color="text.secondary"
        >
          Cadastrado em{" "}
          {new Date(
            equipment.createdAt
          ).toLocaleString(
            "pt-BR"
          )}
          {" • "}
          Atualizado em{" "}
          {new Date(
            equipment.updatedAt
          ).toLocaleString(
            "pt-BR"
          )}
        </Typography>
      </Stack>
    </MainLayout>
  );
}

export default InventoryDetailsPage;