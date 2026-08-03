import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import {
  AddOutlined,
  ArrowBack,
  BusinessOutlined,
  CalendarMonthOutlined,
  ConfirmationNumberOutlined,
  EditOutlined,
  InfoOutlined,
  Inventory2Outlined,
  NotesOutlined,
  OpenInNewOutlined,
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

import InfoCard from "../../components/common/InfoCard";

import {
  inventoryTimelineFilters,
  mapInventoryHistoryToTimeline,
} from "../../components/inventory/inventoryHistoryTimelineMapper";

import MainLayout from "../../components/layout/MainLayout";

import {
  Timeline,
} from "../../components/timeline";

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
  getTickets,
} from "../../services/ticketService";

import {
  getUserById,
} from "../../services/userService";

import type {
  InventoryCondition,
  InventoryStatus,
} from "../../types/InventoryItem";

import type {
  TicketPriority,
  TicketStatus,
} from "../../types/Ticket";

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
      return "default";

    default:
      return "default";
  }
}

function getTicketStatusColor(
  status: TicketStatus
): ChipColor {
  switch (status) {
    case "Aberto":
      return "warning";

    case "Em andamento":
      return "info";

    case "Resolvido":
      return "success";

    default:
      return "default";
  }
}

function getTicketPriorityColor(
  priority: TicketPriority
): ChipColor {
  switch (priority) {
    case "Crítica":
      return "error";

    case "Alta":
      return "error";

    case "Média":
      return "warning";

    case "Baixa":
      return "success";

    default:
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

  const date = new Date(
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

function formatDateTime(
  value: string
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Data inválida";
  }

  return date.toLocaleString(
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

  const relatedTickets =
    getTickets()
      .filter(
        (ticket) =>
          ticket.inventoryItemId ===
          equipment.id
      )
      .sort(
        (
          firstTicket,
          secondTicket
        ) =>
          new Date(
            secondTicket.createdAt
          ).getTime() -
          new Date(
            firstTicket.createdAt
          ).getTime()
      );

  const historyEvents =
    getInventoryHistory(
      equipment.id
    );

  const timelineEvents =
    mapInventoryHistoryToTimeline(
      historyEvents
    );

  function handleCreateTicket(): void {
    navigate(
      `/tickets/new?inventoryItemId=${equipment.id}`
    );
  }

  function handleOpenTicket(
    ticketId: number
  ): void {
    navigate(
      `/tickets/${ticketId}`
    );
  }

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
              color={getStatusColor(
                equipment.status
              )}
              label={
                equipment.status
              }
            />

            <Chip
              color={getConditionColor(
                equipment.condition
              )}
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

        <InfoCard
          title="Identificação"
          icon={
            <Inventory2Outlined color="primary" />
          }
        >
          <Stack spacing={3}>
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
                  color={getStatusColor(
                    equipment.status
                  )}
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
                  color={getConditionColor(
                    equipment.condition
                  )}
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
        </InfoCard>

        <InfoCard
          title="Informações do equipamento"
          icon={
            <InfoOutlined color="primary" />
          }
        >
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
        </InfoCard>

        <InfoCard
          title="Localização"
          icon={
            <BusinessOutlined color="primary" />
          }
        >
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
                {equipment.location ||
                  "Não informada"}
              </Typography>
            </Box>
          </Stack>
        </InfoCard>

        <InfoCard
          title="Responsável"
          icon={
            <PersonOutline color="primary" />
          }
        >
          <Stack spacing={0.5}>
            <Typography
              fontWeight={700}
            >
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
        </InfoCard>

        <InfoCard
          title="Aquisição e garantia"
          icon={
            <CalendarMonthOutlined color="primary" />
          }
        >
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
        </InfoCard>

        <InfoCard
          title="Observações"
          icon={
            <NotesOutlined color="primary" />
          }
        >
          <Typography
            color={
              equipment.notes
                ? "text.primary"
                : "text.secondary"
            }
            sx={{
              whiteSpace:
                "pre-wrap",
            }}
          >
            {equipment.notes ||
              "Nenhuma observação cadastrada."}
          </Typography>
        </InfoCard>

        <InfoCard
          title={`Chamados relacionados (${relatedTickets.length})`}
          icon={
            <ConfirmationNumberOutlined color="primary" />
          }
          actions={
            can(
              Permissions.tickets.create
            ) ? (
              <Button
                variant="contained"
                size="small"
                startIcon={
                  <AddOutlined />
                }
                onClick={
                  handleCreateTicket
                }
              >
                Novo chamado
              </Button>
            ) : undefined
          }
        >
          {relatedTickets.length ===
          0 ? (
            <Alert severity="info">
              Este equipamento ainda não possui chamados
              relacionados.
            </Alert>
          ) : (
            <Stack
              divider={
                <Divider flexItem />
              }
              spacing={0}
            >
              {relatedTickets.map(
                (ticket) => (
                  <Stack
                    key={
                      ticket.id
                    }
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
                    sx={{
                      py: 2,
                      "&:first-of-type": {
                        pt: 0,
                      },
                      "&:last-of-type": {
                        pb: 0,
                      },
                    }}
                  >
                    <Stack spacing={1}>
                      <Stack
                        direction={{
                          xs: "column",
                          sm: "row",
                        }}
                        spacing={1}
                        alignItems={{
                          xs: "flex-start",
                          sm: "center",
                        }}
                      >
                        <Typography
                          fontWeight={700}
                        >
                          #{ticket.id} —{" "}
                          {ticket.title}
                        </Typography>

                        <Chip
                          size="small"
                          label={
                            ticket.status
                          }
                          color={getTicketStatusColor(
                            ticket.status
                          )}
                        />

                        <Chip
                          size="small"
                          label={
                            ticket.priority
                          }
                          color={getTicketPriorityColor(
                            ticket.priority
                          )}
                          variant="outlined"
                        />
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Categoria:{" "}
                        {ticket.category}
                        {" • "}
                        Criado em{" "}
                        {formatDateTime(
                          ticket.createdAt
                        )}
                      </Typography>
                    </Stack>

                    {can(
                      Permissions.tickets.view
                    ) && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={
                          <OpenInNewOutlined />
                        }
                        onClick={() =>
                          handleOpenTicket(
                            ticket.id
                          )
                        }
                      >
                        Abrir chamado
                      </Button>
                    )}
                  </Stack>
                )
              )}
            </Stack>
          )}
        </InfoCard>

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