import {
  Button,
  Paper,
  Stack,
} from "@mui/material";

import {
  ArrowBack,
  DeleteOutline,
  EditOutlined,
} from "@mui/icons-material";

interface TicketActionsProps {
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function TicketActions({
  onBack,
  onEdit,
  onDelete,
}: TicketActionsProps) {
  const hasTicketActions = Boolean(
    onEdit || onDelete
  );

  return (
    <Paper
      sx={{
        p: {
          xs: 2,
          md: 3,
        },
      }}
    >
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        justifyContent="space-between"
        spacing={2}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={onBack}
        >
          Voltar
        </Button>

        {hasTicketActions && (
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1.5}
          >
            {onEdit && (
              <Button
                variant="contained"
                startIcon={<EditOutlined />}
                onClick={onEdit}
              >
                Editar chamado
              </Button>
            )}

            {onDelete && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutline />}
                onClick={onDelete}
              >
                Excluir chamado
              </Button>
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}