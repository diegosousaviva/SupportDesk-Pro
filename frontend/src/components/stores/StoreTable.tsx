import {
  DeleteOutline,
  EditOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";

import {
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

import type {
  Store,
} from "../../types/Store";

interface StoreTableProps {
  stores: Store[];

  onView: (
    storeId: number
  ) => void;

  onEdit: (
    storeId: number
  ) => void;

  onDelete: (
    storeId: number
  ) => void;
}

function StoreTable({
  stores,
  onView,
  onEdit,
  onDelete,
}: StoreTableProps) {
  const {
    can,
  } = usePermissions();

  const canEdit =
    can(
      Permissions.stores.edit
    );

  const canDelete =
    can(
      Permissions.stores.delete
    );

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              Código
            </TableCell>

            <TableCell>
              Loja
            </TableCell>

            <TableCell>
              Cidade
            </TableCell>

            <TableCell>
              Estado
            </TableCell>

            <TableCell>
              Gerente
            </TableCell>

            <TableCell>
              Status
            </TableCell>

            <TableCell
              align="right"
            >
              Ações
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {stores.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
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
                    Nenhuma loja encontrada
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Ajuste a pesquisa ou cadastre uma nova loja.
                  </Typography>
                </Stack>
              </TableCell>
            </TableRow>
          ) : (
            stores.map(
              (store) => (
                <TableRow
                  key={store.id}
                  hover
                >
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                    >
                      {store.code}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {store.name}
                  </TableCell>

                  <TableCell>
                    {store.city ||
                      "Não informado"}
                  </TableCell>

                  <TableCell>
                    {store.state ||
                      "Não informado"}
                  </TableCell>

                  <TableCell>
                    {store.manager ||
                      "Não informado"}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={
                        store.status
                      }
                      color={
                        store.status ===
                        "Ativa"
                          ? "success"
                          : "default"
                      }
                      size="small"
                      variant={
                        store.status ===
                        "Ativa"
                          ? "filled"
                          : "outlined"
                      }
                    />
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
                          aria-label={`Visualizar ${store.name}`}
                          onClick={() =>
                            onView(
                              store.id
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
                            aria-label={`Editar ${store.name}`}
                            onClick={() =>
                              onEdit(
                                store.id
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
                            aria-label={`Excluir ${store.name}`}
                            onClick={() =>
                              onDelete(
                                store.id
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
              )
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default StoreTable;