import {
  Avatar,
  Box,
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

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

import RoleChip from "../chips/RoleChip";

import type { User } from "../../types/User";

interface UserTableProps {
  users: User[];
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function UserTable({
  users,
  onView,
  onEdit,
  onDelete,
}: UserTableProps) {
  const hasActions = Boolean(
    onView ||
    onEdit ||
    onDelete
  );

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Usuário</TableCell>
            <TableCell>E-mail</TableCell>
            <TableCell>Departamento</TableCell>
            <TableCell>Perfil</TableCell>
            <TableCell>Status</TableCell>

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
                colSpan={hasActions ? 6 : 5}
                align="center"
              >
                <Typography
                  color="text.secondary"
                  py={3}
                >
                  Nenhum usuário encontrado.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
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
                      {getInitials(user.name)}
                    </Avatar>

                    <Box>
                      <Typography fontWeight={600}>
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
                  <RoleChip role={user.role} />
                </TableCell>

                <TableCell>
                  <Chip
                    label={user.status}
                    color={
                      user.status === "Ativo"
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
                          onClick={() => onView(user.id)}
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
                          onClick={() => onEdit(user.id)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    {onDelete && (
                      <Tooltip title="Excluir">
                        <IconButton
                          color="error"
                          aria-label={`Excluir ${user.name}`}
                          onClick={() => onDelete(user.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default UserTable;