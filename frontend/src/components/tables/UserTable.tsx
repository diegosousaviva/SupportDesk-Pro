import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";

import RoleChip from "../chips/RoleChip";

import type {
  User,
} from "../../types/User";

export type UserSortField =
  | "name"
  | "email"
  | "department"
  | "role"
  | "status";

export type UserSortDirection =
  | "asc"
  | "desc";

interface UserTableProps {
  users: User[];

  sortField: UserSortField;

  sortDirection: UserSortDirection;

  statusChangingUserId?:
    | number
    | null;

  onSort: (
    field: UserSortField
  ) => void;

  onView?: (
    id: number
  ) => void;

  onEdit?: (
    id: number
  ) => void;

  onStatusChange?: (
    user: User
  ) => void;

  onDelete?: (
    id: number
  ) => void;
}

function getInitials(
  name: string
): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part[0].toUpperCase()
    )
    .join("");
}

function UserTable({
  users,
  sortField,
  sortDirection,
  statusChangingUserId = null,
  onSort,
  onView,
  onEdit,
  onStatusChange,
  onDelete,
}: UserTableProps) {
  const hasActions = Boolean(
    onView ||
      onEdit ||
      onStatusChange ||
      onDelete
  );

  function createSortHandler(
    field: UserSortField
  ) {
    return () => {
      onSort(field);
    };
  }

  return (
    <TableContainer
      component={Paper}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sortDirection={
                sortField === "name"
                  ? sortDirection
                  : false
              }
            >
              <TableSortLabel
                active={
                  sortField === "name"
                }
                direction={
                  sortField === "name"
                    ? sortDirection
                    : "asc"
                }
                onClick={createSortHandler(
                  "name"
                )}
              >
                Usuário
              </TableSortLabel>
            </TableCell>

            <TableCell
              sortDirection={
                sortField === "email"
                  ? sortDirection
                  : false
              }
            >
              <TableSortLabel
                active={
                  sortField === "email"
                }
                direction={
                  sortField === "email"
                    ? sortDirection
                    : "asc"
                }
                onClick={createSortHandler(
                  "email"
                )}
              >
                E-mail
              </TableSortLabel>
            </TableCell>

            <TableCell
              sortDirection={
                sortField ===
                "department"
                  ? sortDirection
                  : false
              }
            >
              <TableSortLabel
                active={
                  sortField ===
                  "department"
                }
                direction={
                  sortField ===
                  "department"
                    ? sortDirection
                    : "asc"
                }
                onClick={createSortHandler(
                  "department"
                )}
              >
                Departamento
              </TableSortLabel>
            </TableCell>

            <TableCell
              sortDirection={
                sortField === "role"
                  ? sortDirection
                  : false
              }
            >
              <TableSortLabel
                active={
                  sortField === "role"
                }
                direction={
                  sortField === "role"
                    ? sortDirection
                    : "asc"
                }
                onClick={createSortHandler(
                  "role"
                )}
              >
                Perfil
              </TableSortLabel>
            </TableCell>

            <TableCell
              sortDirection={
                sortField === "status"
                  ? sortDirection
                  : false
              }
            >
              <TableSortLabel
                active={
                  sortField ===
                  "status"
                }
                direction={
                  sortField ===
                  "status"
                    ? sortDirection
                    : "asc"
                }
                onClick={createSortHandler(
                  "status"
                )}
              >
                Status
              </TableSortLabel>
            </TableCell>

            {hasActions && (
              <TableCell align="center">
                Ações
              </TableCell>
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={
                  hasActions ? 6 : 5
                }
                align="center"
              >
                <Typography
                  color="text.secondary"
                  py={3}
                >
                  Nenhum usuário
                  encontrado.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const isChangingStatus =
                statusChangingUserId ===
                user.id;

              return (
                <TableRow
                  hover
                  key={user.id}
                >
                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                    >
                      <Avatar>
                        {getInitials(
                          user.name
                        )}
                      </Avatar>

                      <Box>
                        <Typography
                          fontWeight={600}
                        >
                          {user.name}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {user.phone}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    {user.email}
                  </TableCell>

                  <TableCell>
                    {user.department}
                  </TableCell>

                  <TableCell>
                    <RoleChip
                      role={user.role}
                    />
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={user.status}
                      color={
                        user.status ===
                        "Ativo"
                          ? "success"
                          : "default"
                      }
                      size="small"
                    />
                  </TableCell>

                  {hasActions && (
                    <TableCell align="center">
                      {onView && (
                        <Tooltip title="Visualizar">
                          <IconButton
                            color="primary"
                            aria-label={`Visualizar ${user.name}`}
                            onClick={() =>
                              onView(
                                user.id
                              )
                            }
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {onEdit && (
                        <Tooltip title="Editar">
                          <IconButton
                            color="warning"
                            aria-label={`Editar ${user.name}`}
                            onClick={() =>
                              onEdit(
                                user.id
                              )
                            }
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {onStatusChange && (
                        <Tooltip
                          title={
                            user.status ===
                            "Ativo"
                              ? "Inativar"
                              : "Ativar"
                          }
                        >
                          <span>
                            <IconButton
                              color={
                                user.status ===
                                "Ativo"
                                  ? "default"
                                  : "success"
                              }
                              disabled={
                                isChangingStatus
                              }
                              aria-label={
                                user.status ===
                                "Ativo"
                                  ? `Inativar ${user.name}`
                                  : `Ativar ${user.name}`
                              }
                              onClick={() =>
                                onStatusChange(
                                  user
                                )
                              }
                            >
                              {isChangingStatus ? (
                                <CircularProgress
                                  size={22}
                                  color="inherit"
                                />
                              ) : user.status ===
                                "Ativo" ? (
                                <LockOutlinedIcon />
                              ) : (
                                <LockOpenOutlinedIcon />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}

                      {onDelete && (
                        <Tooltip title="Excluir">
                          <IconButton
                            color="error"
                            aria-label={`Excluir ${user.name}`}
                            onClick={() =>
                              onDelete(
                                user.id
                              )
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default UserTable;