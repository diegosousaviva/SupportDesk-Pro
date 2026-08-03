import {
  DeleteOutline,
  EditOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";

import {
  Checkbox,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  Permissions,
} from "../../auth/permissions";

import {
  usePermissions,
} from "../../hooks/usePermissions";

import {
  getStoreById,
} from "../../services/storeService";

import {
  getUserById,
} from "../../services/userService";

import type {
  InventoryCondition,
  InventoryItem,
  InventoryStatus,
} from "../../types/InventoryItem";

interface InventoryTableProps {
  items: InventoryItem[];

  selectedItemIds: number[];

  onSelectionChange: (
    selectedItemIds: number[]
  ) => void;

  onView: (
    itemId: number
  ) => void;

  onEdit: (
    itemId: number
  ) => void;

  onDelete: (
    itemId: number
  ) => void;
}

type StatusChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

function getStatusColor(
  status: InventoryStatus
): StatusChipColor {
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
): StatusChipColor {
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

function InventoryTable({
  items,
  selectedItemIds,
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
}: InventoryTableProps) {
  const {
    can,
  } = usePermissions();

  const canEdit =
    can(
      Permissions.inventory.edit
    );

  const canDelete =
    can(
      Permissions.inventory.delete
    );

  const visibleItemIds =
    items.map(
      (item) =>
        item.id
    );

  const selectedVisibleItemIds =
    visibleItemIds.filter(
      (itemId) =>
        selectedItemIds.includes(
          itemId
        )
    );

  const allVisibleItemsSelected =
    visibleItemIds.length > 0 &&
    selectedVisibleItemIds.length ===
      visibleItemIds.length;

  const someVisibleItemsSelected =
    selectedVisibleItemIds.length > 0 &&
    !allVisibleItemsSelected;

  function handleToggleAllVisible():
    void {
    if (
      allVisibleItemsSelected
    ) {
      onSelectionChange(
        selectedItemIds.filter(
          (itemId) =>
            !visibleItemIds.includes(
              itemId
            )
        )
      );

      return;
    }

    onSelectionChange(
      Array.from(
        new Set([
          ...selectedItemIds,
          ...visibleItemIds,
        ])
      )
    );
  }

  function handleToggleItem(
    itemId: number
  ): void {
    const isSelected =
      selectedItemIds.includes(
        itemId
      );

    if (isSelected) {
      onSelectionChange(
        selectedItemIds.filter(
          (currentItemId) =>
            currentItemId !==
            itemId
        )
      );

      return;
    }

    onSelectionChange([
      ...selectedItemIds,
      itemId,
    ]);
  }

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              padding="checkbox"
            >
              <Tooltip
                title={
                  allVisibleItemsSelected
                    ? "Desmarcar equipamentos visíveis"
                    : "Selecionar equipamentos visíveis"
                }
              >
                <Checkbox
                  checked={
                    allVisibleItemsSelected
                  }
                  indeterminate={
                    someVisibleItemsSelected
                  }
                  disabled={
                    items.length === 0
                  }
                  onChange={
                    handleToggleAllVisible
                  }
                  inputProps={{
                    "aria-label":
                      "Selecionar todos os equipamentos visíveis",
                  }}
                />
              </Tooltip>
            </TableCell>

            <TableCell>
              Etiqueta
            </TableCell>

            <TableCell>
              Patrimônio
            </TableCell>

            <TableCell>
              Equipamento
            </TableCell>

            <TableCell>
              Loja
            </TableCell>

            <TableCell>
              Responsável
            </TableCell>

            <TableCell>
              Situação
            </TableCell>

            <TableCell>
              Estado físico
            </TableCell>

            <TableCell>
              Valor
            </TableCell>

            <TableCell
              align="right"
            >
              Ações
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={10}
              >
                <Stack
                  spacing={0.5}
                  alignItems="center"
                  sx={{
                    py: 5,
                  }}
                >
                  <Typography
                    fontWeight={700}
                  >
                    Nenhum equipamento encontrado
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Ajuste os filtros ou cadastre um novo equipamento.
                  </Typography>
                </Stack>
              </TableCell>
            </TableRow>
          ) : (
            items.map(
              (item) => {
                const store =
                  getStoreById(
                    item.storeId
                  );

                const responsible =
                  item.responsibleUserId ===
                  null
                    ? null
                    : getUserById(
                        item.responsibleUserId
                      );

                const isSelected =
                  selectedItemIds.includes(
                    item.id
                  );

                return (
                  <TableRow
                    key={item.id}
                    hover
                    selected={
                      isSelected
                    }
                    sx={{
                      "&.Mui-selected":
                        {
                          backgroundColor:
                            "action.selected",
                        },

                      "&.Mui-selected:hover":
                        {
                          backgroundColor:
                            "action.hover",
                        },
                    }}
                  >
                    <TableCell
                      padding="checkbox"
                    >
                      <Checkbox
                        checked={
                          isSelected
                        }
                        onChange={() =>
                          handleToggleItem(
                            item.id
                          )
                        }
                        inputProps={{
                          "aria-label":
                            `Selecionar equipamento ${item.tag}`,
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Stack spacing={0.25}>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                        >
                          {item.tag}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {item.tagMode}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      {item.assetNumber ||
                        "Não informado"}
                    </TableCell>

                    <TableCell>
                      <Stack spacing={0.25}>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                        >
                          {item.description}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {item.category}

                          {item.manufacturer
                            ? ` • ${item.manufacturer}`
                            : ""}

                          {item.model
                            ? ` ${item.model}`
                            : ""}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack spacing={0.25}>
                        <Typography
                          variant="body2"
                        >
                          {store?.name ??
                            "Loja não encontrada"}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {item.location}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      {responsible?.name ??
                        "Sem responsável"}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={
                          item.status
                        }
                        color={
                          getStatusColor(
                            item.status
                          )
                        }
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={
                          item.condition
                        }
                        color={
                          getConditionColor(
                            item.condition
                          )
                        }
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      {formatCurrency(
                        item.value
                      )}
                    </TableCell>

                    <TableCell
                      align="right"
                    >
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="flex-end"
                      >
                        <Tooltip title="Visualizar">
                          <IconButton
                            size="small"
                            aria-label={`Visualizar ${item.tag}`}
                            onClick={() =>
                              onView(
                                item.id
                              )
                            }
                          >
                            <VisibilityOutlined />
                          </IconButton>
                        </Tooltip>

                        {canEdit && (
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              aria-label={`Editar ${item.tag}`}
                              onClick={() =>
                                onEdit(
                                  item.id
                                )
                              }
                            >
                              <EditOutlined />
                            </IconButton>
                          </Tooltip>
                        )}

                        {canDelete && (
                          <Tooltip title="Excluir">
                            <IconButton
                              size="small"
                              color="error"
                              aria-label={`Excluir ${item.tag}`}
                              onClick={() =>
                                onDelete(
                                  item.id
                                )
                              }
                            >
                              <DeleteOutline />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              }
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default InventoryTable;