import {
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import type { Category } from "../../types/Category";

interface CategoryTableProps {
  categories: Category[];
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

function CategoryTable({
  categories,
  onView,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  if (categories.length === 0) {
    return (
      <Paper sx={{ p: 4 }}>
        <Typography
          align="center"
          color="text.secondary"
        >
          Nenhuma categoria encontrada.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Nome</strong>
            </TableCell>

            <TableCell>
              <strong>Descrição</strong>
            </TableCell>

            <TableCell align="center">
              <strong>Status</strong>
            </TableCell>

            <TableCell align="center">
              <strong>Ações</strong>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {categories.map((category) => (
            <TableRow
              hover
              key={category.id}
            >
              <TableCell>
                {category.name}
              </TableCell>

              <TableCell>
                {category.description}
              </TableCell>

              <TableCell align="center">
                <Chip
                  label={
                    category.active
                      ? "Ativa"
                      : "Inativa"
                  }
                  color={
                    category.active
                      ? "success"
                      : "default"
                  }
                  size="small"
                />
              </TableCell>

              <TableCell align="center">
                <Tooltip title="Visualizar">
                  <IconButton
                    onClick={() =>
                      onView(category.id)
                    }
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Editar">
                  <IconButton
                    onClick={() =>
                      onEdit(category.id)
                    }
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Excluir">
                  <IconButton
                    color="error"
                    onClick={() =>
                      onDelete(category.id)
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default CategoryTable;