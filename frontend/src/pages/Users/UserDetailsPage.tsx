import { useMemo, useState } from "react";
import {
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BusinessIcon from "@mui/icons-material/Business";
import BadgeIcon from "@mui/icons-material/Badge";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import MainLayout from "../../components/layout/MainLayout";
import PageHeader from "../../components/common/PageHeader";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import {
  deleteUser,
  getUserById,
} from "../../services/userService";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function formatDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Data não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(parsedDate);
}

function UserDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [errorMessage, setErrorMessage] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);
  const [deleting, setDeleting] = useState(false);

  const userId = Number(id);

  const user = useMemo(() => {
    if (!Number.isInteger(userId)) {
      return undefined;
    }

    return getUserById(userId);
  }, [userId]);

  if (!Number.isInteger(userId) || !user) {
    return <Navigate to="/users" replace />;
  }

  const currentUserId = user.id;

  function handleOpenDeleteDialog() {
    setErrorMessage("");
    setDeleteDialogOpen(true);
  }

  function handleCloseDeleteDialog() {
    if (!deleting) {
      setDeleteDialogOpen(false);
    }
  }

  function handleDelete() {
    try {
      setDeleting(true);
      setErrorMessage("");

      const deleted = deleteUser(currentUserId);

      if (!deleted) {
        setErrorMessage(
          "Não foi possível excluir o usuário."
        );
        setDeleting(false);
        setDeleteDialogOpen(false);
        return;
      }

      navigate("/users");
    } catch {
      setErrorMessage(
        "Ocorreu um erro ao excluir o usuário."
      );
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  }

  return (
    <MainLayout title="Detalhes do Usuário">
      <PageHeader
        title="Detalhes do Usuário"
        subtitle="Consulte as informações cadastradas."
      />

      <Box
        sx={{
          mt: 3,
          mb: 2,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/users")}
        >
          Voltar para usuários
        </Button>

        <Stack
          direction="row"
          spacing={1.5}
        >
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() =>
              navigate(`/users/${currentUserId}/edit`)
            }
          >
            Editar
          </Button>

          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleOpenDeleteDialog}
          >
            Excluir
          </Button>
        </Stack>
      </Box>

      {errorMessage && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {errorMessage}
        </Alert>
      )}

      <Paper
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={3}
          alignItems={{
            xs: "flex-start",
            sm: "center",
          }}
        >
          <Avatar
            sx={{
              width: 88,
              height: 88,
              fontSize: "1.75rem",
              fontWeight: 700,
              bgcolor: "primary.main",
            }}
          >
            {getInitials(user.name)}
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h5"
              fontWeight={800}
            >
              {user.name}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              mt={0.5}
            >
              Usuário #{currentUserId}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              mt={2}
              flexWrap="wrap"
              useFlexGap
            >
              <Chip
                label={user.role}
                color={
                  user.role === "Administrador"
                    ? "error"
                    : user.role === "Técnico"
                      ? "primary"
                      : "default"
                }
              />

              <Chip
                label={user.status}
                color={
                  user.status === "Ativo"
                    ? "success"
                    : "default"
                }
              />
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="flex-start"
            >
              <EmailIcon color="primary" />

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  E-mail
                </Typography>

                <Typography fontWeight={600}>
                  {user.email}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="flex-start"
            >
              <PhoneIcon color="primary" />

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Telefone
                </Typography>

                <Typography fontWeight={600}>
                  {user.phone || "Não informado"}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="flex-start"
            >
              <BusinessIcon color="primary" />

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Departamento
                </Typography>

                <Typography fontWeight={600}>
                  {user.department || "Não informado"}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="flex-start"
            >
              <BadgeIcon color="primary" />

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Perfil de acesso
                </Typography>

                <Typography fontWeight={600}>
                  {user.role}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="flex-start"
            >
              <CalendarMonthIcon color="primary" />

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Cadastrado em
                </Typography>

                <Typography fontWeight={600}>
                  {formatDate(user.createdAt)}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Excluir usuário"
        message={`Deseja realmente excluir o usuário ${user.name}? Esta ação não poderá ser desfeita.`}
        confirmLabel="Excluir usuário"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={handleCloseDeleteDialog}
      />
    </MainLayout>
  );
}

export default UserDetailsPage;