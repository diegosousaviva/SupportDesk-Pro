import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  AddOutlined,
  ClearAllOutlined,
  FilterAltOffOutlined,
  PrintOutlined,
} from "@mui/icons-material";

import {
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  Permissions,
} from "../../auth/permissions";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import PageHeader from "../../components/common/PageHeader";
import InventoryStatistics from "../../components/inventory/InventoryStatistics";
import InventoryTable from "../../components/inventory/InventoryTable";
import MainLayout from "../../components/layout/MainLayout";

import {
  usePermissions,
} from "../../hooks/usePermissions";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

import {
  deleteInventoryItem,
  getInventoryItems,
} from "../../services/inventoryService";

import {
  getStores,
} from "../../services/storeService";

import {
  getUsers,
} from "../../services/userService";

import type {
  InventoryCondition,
  InventoryItem,
  InventoryStatus,
} from "../../types/InventoryItem";

const ALL_STATUS_VALUE =
  "Todos";

const ALL_CONDITIONS_VALUE =
  "Todos";

const ALL_STORES_VALUE =
  "Todas";

type StatusFilter =
  | InventoryStatus
  | typeof ALL_STATUS_VALUE;

type ConditionFilter =
  | InventoryCondition
  | typeof ALL_CONDITIONS_VALUE;

function InventoryListPage() {
  const navigate =
    useNavigate();

  const {
    can,
  } = usePermissions();

  const {
    showSnackbar,
  } = useSnackbar();

  const [
    items,
    setItems,
  ] = useState<InventoryItem[]>([]);

  const [
    selectedItemIds,
    setSelectedItemIds,
  ] = useState<number[]>([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<StatusFilter>(
    ALL_STATUS_VALUE
  );

  const [
    conditionFilter,
    setConditionFilter,
  ] = useState<ConditionFilter>(
    ALL_CONDITIONS_VALUE
  );

  const [
    storeFilter,
    setStoreFilter,
  ] = useState(
    ALL_STORES_VALUE
  );

  const [
    selectedItemIdForDelete,
    setSelectedItemIdForDelete,
  ] = useState<number | null>(
    null
  );

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const stores =
    getStores();

  const users =
    getUsers();

  useEffect(() => {
    setItems(
      getInventoryItems()
    );
  }, []);

  const filteredItems =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLocaleLowerCase(
            "pt-BR"
          );

      return items.filter(
        (item) => {
          const store =
            stores.find(
              (currentStore) =>
                currentStore.id ===
                item.storeId
            );

          const responsible =
            item.responsibleUserId ===
            null
              ? undefined
              : users.find(
                  (user) =>
                    user.id ===
                    item.responsibleUserId
                );

          const searchableContent =
            [
              item.tag,
              item.assetNumber,
              item.description,
              item.category,
              item.manufacturer,
              item.model,
              item.serialNumber,
              item.location,
              item.status,
              item.condition,
              store?.code ?? "",
              store?.name ?? "",
              responsible?.name ?? "",
              responsible?.email ?? "",
            ]
              .join(" ")
              .toLocaleLowerCase(
                "pt-BR"
              );

          const matchesSearch =
            !normalizedSearch ||
            searchableContent.includes(
              normalizedSearch
            );

          const matchesStatus =
            statusFilter ===
              ALL_STATUS_VALUE ||
            item.status ===
              statusFilter;

          const matchesCondition =
            conditionFilter ===
              ALL_CONDITIONS_VALUE ||
            item.condition ===
              conditionFilter;

          const matchesStore =
            storeFilter ===
              ALL_STORES_VALUE ||
            item.storeId ===
              Number(
                storeFilter
              );

          return (
            matchesSearch &&
            matchesStatus &&
            matchesCondition &&
            matchesStore
          );
        }
      );
    }, [
      items,
      search,
      statusFilter,
      conditionFilter,
      storeFilter,
      stores,
      users,
    ]);

  const selectedItems =
    useMemo(
      () =>
        items.filter(
          (item) =>
            selectedItemIds.includes(
              item.id
            )
        ),
      [
        items,
        selectedItemIds,
      ]
    );

  const hasActiveFilters =
    Boolean(
      search.trim()
    ) ||
    statusFilter !==
      ALL_STATUS_VALUE ||
    conditionFilter !==
      ALL_CONDITIONS_VALUE ||
    storeFilter !==
      ALL_STORES_VALUE;

  function handleClearFilters():
    void {
    setSearch("");

    setStatusFilter(
      ALL_STATUS_VALUE
    );

    setConditionFilter(
      ALL_CONDITIONS_VALUE
    );

    setStoreFilter(
      ALL_STORES_VALUE
    );
  }

  function handleClearSelection():
    void {
    setSelectedItemIds([]);
  }

  function handlePrintSelected():
    void {
    if (
      selectedItemIds.length ===
      0
    ) {
      showSnackbar(
        "Selecione pelo menos um equipamento.",
        {
          severity:
            "warning",
        }
      );

      return;
    }

    const queryParameters =
      new URLSearchParams();

    queryParameters.set(
      "ids",
      selectedItemIds.join(",")
    );

    navigate(
      `/inventory/labels?${queryParameters.toString()}`
    );
  }

  function handleDeleteClick(
    itemId: number
  ): void {
    setSelectedItemIdForDelete(
      itemId
    );

    setDeleteDialogOpen(
      true
    );
  }

  function handleCancelDelete():
    void {
    if (deleting) {
      return;
    }

    setDeleteDialogOpen(
      false
    );

    setSelectedItemIdForDelete(
      null
    );
  }

  async function handleConfirmDelete():
    Promise<void> {
    if (
      selectedItemIdForDelete ===
      null
    ) {
      return;
    }

    const itemId =
      selectedItemIdForDelete;

    try {
      setDeleting(
        true
      );

      const deleted =
        await Promise.resolve(
          deleteInventoryItem(
            itemId
          )
        );

      if (!deleted) {
        throw new Error(
          "O equipamento não foi encontrado."
        );
      }

      setItems(
        (
          currentItems
        ) =>
          currentItems.filter(
            (item) =>
              item.id !==
              itemId
          )
      );

      setSelectedItemIds(
        (
          currentSelectedItemIds
        ) =>
          currentSelectedItemIds.filter(
            (
              selectedItemId
            ) =>
              selectedItemId !==
              itemId
          )
      );

      setDeleteDialogOpen(
        false
      );

      setSelectedItemIdForDelete(
        null
      );

      showSnackbar(
        "Equipamento excluído com sucesso.",
        {
          severity:
            "success",
        }
      );
    } catch (error) {
      console.error(
        "Não foi possível excluir o equipamento.",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o equipamento.";

      showSnackbar(
        message,
        {
          severity:
            "error",
        }
      );
    } finally {
      setDeleting(
        false
      );
    }
  }

  return (
    <MainLayout title="Inventário">
      <Stack spacing={3}>
        <PageHeader
          title="Inventário de TI"
          subtitle="Gerencie os equipamentos, etiquetas, lojas, responsáveis e valores do patrimônio de TI."
        />

        <InventoryStatistics
          items={
            filteredItems
          }
        />

        <Paper
          variant="outlined"
          sx={{
            p: 2,
          }}
        >
          <Stack spacing={2}>
            <Stack
              direction={{
                xs: "column",
                lg: "row",
              }}
              spacing={2}
              alignItems={{
                xs: "stretch",
                lg: "center",
              }}
            >
              <TextField
                label="Pesquisar equipamento"
                placeholder="Etiqueta, patrimônio, descrição, série, loja ou responsável"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                fullWidth
                sx={{
                  flex: 2,

                  minWidth: {
                    lg: 360,
                  },
                }}
              />

              <TextField
                select
                label="Situação"
                value={
                  statusFilter
                }
                onChange={(event) =>
                  setStatusFilter(
                    event.target
                      .value as StatusFilter
                  )
                }
                sx={{
                  minWidth: {
                    lg: 190,
                  },
                }}
              >
                <MenuItem
                  value={
                    ALL_STATUS_VALUE
                  }
                >
                  Todas
                </MenuItem>

                <MenuItem value="Em uso">
                  Em uso
                </MenuItem>

                <MenuItem value="Em estoque">
                  Em estoque
                </MenuItem>

                <MenuItem value="Em manutenção">
                  Em manutenção
                </MenuItem>

                <MenuItem value="Emprestado">
                  Emprestado
                </MenuItem>

                <MenuItem value="Reserva">
                  Reserva
                </MenuItem>

                <MenuItem value="Descartado">
                  Descartado
                </MenuItem>

                <MenuItem value="Baixado">
                  Baixado
                </MenuItem>
              </TextField>

              <TextField
                select
                label="Estado físico"
                value={
                  conditionFilter
                }
                onChange={(event) =>
                  setConditionFilter(
                    event.target
                      .value as ConditionFilter
                  )
                }
                sx={{
                  minWidth: {
                    lg: 180,
                  },
                }}
              >
                <MenuItem
                  value={
                    ALL_CONDITIONS_VALUE
                  }
                >
                  Todos
                </MenuItem>

                <MenuItem value="Novo">
                  Novo
                </MenuItem>

                <MenuItem value="Excelente">
                  Excelente
                </MenuItem>

                <MenuItem value="Bom">
                  Bom
                </MenuItem>

                <MenuItem value="Regular">
                  Regular
                </MenuItem>

                <MenuItem value="Ruim">
                  Ruim
                </MenuItem>

                <MenuItem value="Sucata">
                  Sucata
                </MenuItem>
              </TextField>

              <TextField
                select
                label="Loja"
                value={
                  storeFilter
                }
                onChange={(event) =>
                  setStoreFilter(
                    event.target.value
                  )
                }
                sx={{
                  minWidth: {
                    lg: 210,
                  },
                }}
              >
                <MenuItem
                  value={
                    ALL_STORES_VALUE
                  }
                >
                  Todas
                </MenuItem>

                {stores.map(
                  (store) => (
                    <MenuItem
                      key={
                        store.id
                      }
                      value={String(
                        store.id
                      )}
                    >
                      {store.code} —{" "}
                      {store.name}
                    </MenuItem>
                  )
                )}
              </TextField>
            </Stack>

            <Box
              sx={{
                display:
                  "flex",

                flexDirection: {
                  xs: "column",
                  sm: "row",
                },

                gap: 1.5,

                justifyContent:
                  "space-between",
              }}
            >
              <Button
                variant="text"
                startIcon={
                  <FilterAltOffOutlined />
                }
                onClick={
                  handleClearFilters
                }
                disabled={
                  !hasActiveFilters
                }
              >
                Limpar filtros
              </Button>

              {can(
                Permissions.inventory.create
              ) && (
                <Button
                  variant="contained"
                  startIcon={
                    <AddOutlined />
                  }
                  onClick={() =>
                    navigate(
                      "/inventory/new"
                    )
                  }
                >
                  Novo equipamento
                </Button>
              )}
            </Box>
          </Stack>
        </Paper>

        {selectedItemIds.length >
          0 && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,

              borderColor:
                "primary.main",

              backgroundColor:
                "action.selected",
            }}
          >
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{
                xs: "stretch",
                sm: "center",
              }}
            >
              <Box>
                <Typography
                  fontWeight={700}
                >
                  {
                    selectedItemIds.length
                  }{" "}
                  equipamento
                  {selectedItemIds.length ===
                  1
                    ? ""
                    : "s"}{" "}
                  selecionado
                  {selectedItemIds.length ===
                  1
                    ? ""
                    : "s"}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {selectedItems
                    .slice(0, 3)
                    .map(
                      (item) =>
                        item.tag
                    )
                    .join(", ")}

                  {selectedItems.length >
                  3
                    ? ` e mais ${
                        selectedItems.length -
                        3
                      }`
                    : ""}
                </Typography>
              </Box>

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1}
              >
                <Button
                  variant="text"
                  startIcon={
                    <ClearAllOutlined />
                  }
                  onClick={
                    handleClearSelection
                  }
                >
                  Limpar seleção
                </Button>

                <Button
                  variant="contained"
                  startIcon={
                    <PrintOutlined />
                  }
                  onClick={
                    handlePrintSelected
                  }
                >
                  Imprimir etiquetas
                </Button>
              </Stack>
            </Stack>
          </Paper>
        )}

        <InventoryTable
          items={
            filteredItems
          }
          selectedItemIds={
            selectedItemIds
          }
          onSelectionChange={
            setSelectedItemIds
          }
          onView={(itemId) =>
            navigate(
              `/inventory/${itemId}`
            )
          }
          onEdit={(itemId) =>
            navigate(
              `/inventory/${itemId}/edit`
            )
          }
          onDelete={
            handleDeleteClick
          }
        />

        <ConfirmDialog
          open={
            deleteDialogOpen
          }
          title="Excluir equipamento"
          message="Deseja realmente excluir este equipamento do inventário?"
          confirmLabel="Excluir"
          confirmColor="error"
          loading={
            deleting
          }
          onCancel={
            handleCancelDelete
          }
          onConfirm={
            handleConfirmDelete
          }
        />
      </Stack>
    </MainLayout>
  );
}

export default InventoryListPage;