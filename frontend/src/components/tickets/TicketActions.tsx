import {
  Button,
  Paper,
  Stack,
} from "@mui/material";

import {
  ArrowBack,
  CheckCircleOutline,
  DeleteOutline,
  EditOutlined,
  SyncAltOutlined,
} from "@mui/icons-material";

interface TicketActionsProps {
  onBack: () => void;

  onEdit?: () => void;

  onUpdateStatus?: () => void;

  onClose?: () => void;

  onDelete?: () => void;

  disabled?: boolean;
}

export default function TicketActions({
  onBack,
  onEdit,
  onUpdateStatus,
  onClose,
  onDelete,
  disabled = false,
}: TicketActionsProps) {
  const hasTicketActions =
    Boolean(
      onEdit ||
      onUpdateStatus ||
      onClose ||
      onDelete
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
          startIcon={
            <ArrowBack />
          }
          onClick={
            onBack
          }
          disabled={
            disabled
          }
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
            flexWrap="wrap"
            useFlexGap
          >
            {onUpdateStatus && (
              <Button
                variant="outlined"
                color="info"
                startIcon={
                  <SyncAltOutlined />
                }
                onClick={
                  onUpdateStatus
                }
                disabled={
                  disabled
                }
              >
                Alterar status
              </Button>
            )}

            {onClose && (
              <Button
                variant="contained"
                color="success"
                startIcon={
                  <CheckCircleOutline />
                }
                onClick={
                  onClose
                }
                disabled={
                  disabled
                }
              >
                Resolver chamado
              </Button>
            )}

            {onEdit && (
              <Button
                variant="contained"
                startIcon={
                  <EditOutlined />
                }
                onClick={
                  onEdit
                }
                disabled={
                  disabled
                }
              >
                Editar chamado
              </Button>
            )}

            {onDelete && (
              <Button
                variant="outlined"
                color="error"
                startIcon={
                  <DeleteOutline />
                }
                onClick={
                  onDelete
                }
                disabled={
                  disabled
                }
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