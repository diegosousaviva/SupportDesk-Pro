import {
  useMemo,
  useState,
} from "react";

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
import HistoryIcon from "@mui/icons-material/History";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

import {
  Permissions,
} from "../../auth/permissions";

import MainLayout from "../../components/layout/MainLayout";
import PageHeader from "../../components/common/PageHeader";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import {
  usePermissions,
} from "../../hooks/usePermissions";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

import {
  deleteUser,
  getUserById,
} from "../../services/userService";

import {
  getUserHistory,
} from "../../services/userHistoryService";

import type {
  UserHistoryAction,
} from "../../types/UserHistory";

function getInitials(
  name: string
): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");
}

function formatDate(
  date: string
): string {
  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "Data não informada";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "long",
      timeStyle: "short",
    }
  ).format(parsedDate);
}

function getHistoryIcon(
  action: UserHistoryAction
) {
  switch (action) {
    case "created":
      return (
        <PersonAddAltIcon />
      );

    case "updated":
      return (
        <ManageAccountsIcon />
      );

    case "role_changed":
      return (
        <AdminPanelSettingsIcon />
      );

    case "activated":
      return <LockOpenIcon />;

    case "deactivated":
      return <LockIcon />;

    case "deleted":
      return (
        <DeleteForeverIcon />
      );

    default:
      return <HistoryIcon />;
  }
}

function getHistoryColor(
  action: UserHistoryAction
):
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info" {
  switch (action) {
    case "created":
      return "success";

    case "updated":
      return "primary";

    case "role_changed":
      return "info";

    case "activated":
      return "success";

    case "deactivated":
      return "warning";

    case "deleted":
      return "error";

    default:
      return "primary";
  }
}

function UserDetailsPage() {
  const navigate = useNavigate();

  const { id } = useParams();

  const { can } =
    usePermissions();

  const { showSnackbar } =
    useSnackbar();

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const userId = Number(id);

  const user = useMemo(() => {
    if (
      !Number.isInteger(userId)
    ) {
      return undefined;
    }

    return getUserById(userId);
  }, [userId]);

  const userHistory =
    useMemo(() => {
      if (!user) {
        return [];
      }

      return getUserHistory(
        user.id,
        user.createdAt
      );
    }, [user]);

  const canEdit = can(
    Permissions.users.edit
  );

  const canDelete = can(
    Permissions.users.delete
  );

  if (
    !Number.isInteger(userId) ||
    !user
  ) {
    return (
      <Navigate
        to="/users"
        replace
      />
    );
  }

  const currentUserId =
    user.id;

  function handleBack(): void {
    if (deleting) {
      return;
    }

    navigate("/users");
  }

  function handleEdit(): void {
    if (
      !canEdit ||
      deleting
    ) {
      return;
    }

    navigate(
      `/users/${currentUserId}/edit`
    );
  }

  function handleOpenDeleteDialog(): void {
    if (
      !canDelete ||
      deleting
    ) {
      return;
    }

    setErrorMessage("");
    setDeleteDialogOpen(true);
  }

  function handleCloseDeleteDialog(): void {
    if (deleting) {
      return;
    }

    setErrorMessage("");
    setDeleteDialogOpen(false);
  }

  function handleDelete(): void {
    if (
      !canDelete ||
      deleting
    ) {
      return;
    }

    setDeleting(true);
    setErrorMessage("");

    try {
      const deleted =
        deleteUser(
          currentUserId
        );

      if (!deleted) {
        throw new Error(
          "O serviço não confirmou a exclusão do usuário."
        );
      }

      setDeleteDialogOpen(false);

      showSnackbar(
        "Usuário excluído com sucesso.",
        {
          severity: "success",
        }
      );

      navigate("/users");
    } catch (error) {
      console.error(
        "Não foi possível excluir o usuário.",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao excluir o usuário.";

      setErrorMessage(message);

      showSnackbar(
        "Não foi possível excluir o usuário.",
        {
          severity: "error",
        }
      );

      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <MainLayout title="Detalhes do Usuário">
      <PageHeader
        title="Detalhes do Usuário"
        subtitle="Consulte as informações cadastradas e o histórico de atividades."
      />

      <Box
        sx={{
          mt: 3,
          mb: 2,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          justifyContent:
            "space-between",
        }}
      >
        <Button
          variant="outlined"
          startIcon={
            <ArrowBackIcon />
          }
          onClick={handleBack}
          disabled={deleting}
        >
          Voltar para usuários
        </Button>

        {(canEdit ||
          canDelete) && (
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1.5}
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },
            }}
          >
            {canEdit && (
              <Button
                variant="outlined"
                startIcon={
                  <EditIcon />
                }
                onClick={handleEdit}
                disabled={deleting}
              >
                Editar
              </Button>
            )}

            {canDelete && (
              <Button
                variant="contained"
                color="error"
                startIcon={
                  <DeleteIcon />
                }
                onClick={
                  handleOpenDeleteDialog
                }
                disabled={deleting}
              >
                Excluir
              </Button>
            )}
          </Stack>
        )}
      </Box>

      {errorMessage && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() =>
            setErrorMessage("")
          }
        >
          {errorMessage}
        </Alert>
      )}

      <Stack spacing={3}>
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
                fontSize:
                  "1.75rem",
                fontWeight: 700,
                bgcolor:
                  "primary.main",
              }}
            >
              {getInitials(
                user.name
              )}
            </Avatar>

            <Box
              sx={{
                flexGrow: 1,
              }}
            >
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
                Usuário #
                {currentUserId}
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
                    user.role ===
                    "Administrador"
                      ? "error"
                      : user.role ===
                          "Técnico"
                        ? "primary"
                        : "default"
                  }
                />

                <Chip
                  label={user.status}
                  color={
                    user.status ===
                    "Ativo"
                      ? "success"
                      : "default"
                  }
                />
              </Stack>
            </Box>
          </Stack>

          <Divider
            sx={{ my: 3 }}
          />

          <Grid
            container
            spacing={3}
          >
            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
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

                  <Typography
                    fontWeight={600}
                  >
                    {user.email}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
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

                  <Typography
                    fontWeight={600}
                  >
                    {user.phone ||
                      "Não informado"}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
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

                  <Typography
                    fontWeight={600}
                  >
                    {user.department ||
                      "Não informado"}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
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

                  <Typography
                    fontWeight={600}
                  >
                    {user.role}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid
              size={{
                xs: 12,
              }}
            >
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

                  <Typography
                    fontWeight={600}
                  >
                    {formatDate(
                      user.createdAt
                    )}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            mb={3}
          >
            <HistoryIcon color="primary" />

            <Box>
              <Typography
                variant="h6"
                fontWeight={800}
              >
                Histórico do usuário
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Atividades e alterações
                registradas neste
                cadastro.
              </Typography>
            </Box>
          </Stack>

          {userHistory.length ===
          0 ? (
            <Typography
              color="text.secondary"
            >
              Nenhuma atividade
              registrada.
            </Typography>
          ) : (
            <Stack spacing={0}>
              {userHistory.map(
                (
                  historyEntry,
                  index
                ) => (
                  <Box
                    key={
                      historyEntry.id
                    }
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="flex-start"
                      py={2}
                    >
                      <Avatar
                        sx={{
                          width: 42,
                          height: 42,
                          bgcolor: `${getHistoryColor(
                            historyEntry.action
                          )}.main`,
                        }}
                      >
                        {getHistoryIcon(
                          historyEntry.action
                        )}
                      </Avatar>

                      <Box
                        sx={{
                          flexGrow: 1,
                        }}
                      >
                        <Stack
                          direction={{
                            xs: "column",
                            sm: "row",
                          }}
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Typography
                            fontWeight={
                              700
                            }
                          >
                            {
                              historyEntry.title
                            }
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {formatDate(
                              historyEntry.createdAt
                            )}
                          </Typography>
                        </Stack>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mt={0.5}
                        >
                          {
                            historyEntry.description
                          }
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          mt={1}
                        >
                          Realizado por:{" "}
                          {
                            historyEntry.performedBy
                          }
                        </Typography>
                      </Box>
                    </Stack>

                    {index <
                      userHistory.length -
                        1 && (
                      <Divider />
                    )}
                  </Box>
                )
              )}
            </Stack>
          )}
        </Paper>
      </Stack>

      <ConfirmDialog
        open={
          deleteDialogOpen &&
          canDelete
        }
        title="Excluir usuário"
        message={`Deseja realmente excluir o usuário ${user.name}? Esta ação não poderá ser desfeita.`}
        confirmLabel="Excluir usuário"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={
          handleCloseDeleteDialog
        }
      />
    </MainLayout>
  );
}

export default UserDetailsPage;