import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";

import MainLayout from "../../components/layout/MainLayout";

import {
  useAuth,
} from "../../contexts/AuthContext";

import {
  useNotifications,
} from "../../contexts/NotificationContext";

import {
  useSnackbar,
} from "../../hooks/useSnackbar";

import {
  createTicket,
} from "../../services/ticketService";

import {
  getUsers,
} from "../../services/userService";

import type {
  Ticket,
} from "../../types/Ticket";

type TicketPriority =
  Ticket["priority"];

const UNASSIGNED_TECHNICIAN_VALUE =
  "unassigned";

function CreateTicketPage() {
  const navigate =
    useNavigate();

  const {
    user,
  } = useAuth();

  const {
    addNotification,
  } = useNotifications();

  const {
    showSnackbar,
  } = useSnackbar();

  const technicians =
    getUsers().filter(
      (currentUser) =>
        currentUser.role ===
          "Técnico" &&
        currentUser.status ===
          "Ativo"
    );

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("");

  const [
    priority,
    setPriority,
  ] =
    useState<
      TicketPriority | ""
    >("");

  const [
    assignedTechnicianId,
    setAssignedTechnicianId,
  ] = useState(
    UNASSIGNED_TECHNICIAN_VALUE
  );

  const [
    equipment,
    setEquipment,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  function getNotificationSeverity():
    | "info"
    | "warning"
    | "error" {
    if (
      priority ===
      "Crítica"
    ) {
      return "error";
    }

    if (
      priority ===
      "Alta"
    ) {
      return "warning";
    }

    return "info";
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): void {
    event.preventDefault();

    setErrorMessage("");

    if (
      !title.trim() ||
      !category ||
      !priority ||
      !description.trim()
    ) {
      setErrorMessage(
        "Preencha todos os campos obrigatórios."
      );

      showSnackbar(
        "Preencha todos os campos obrigatórios.",
        {
          severity:
            "warning",
        }
      );

      return;
    }

    try {
      setIsSubmitting(
        true
      );

      const selectedTechnicianId =
        assignedTechnicianId ===
        UNASSIGNED_TECHNICIAN_VALUE
          ? null
          : Number(
              assignedTechnicianId
            );

      const completeDescription =
        equipment.trim()
          ? `${description.trim()}\n\nEquipamento: ${equipment.trim()}`
          : description.trim();

      const createdTicket =
        createTicket({
          title:
            title.trim(),

          description:
            completeDescription,

          category,

          priority,

          status:
            "Aberto",

          requesterUserId:
            user?.id ?? 1,

          assignedTechnicianId:
            selectedTechnicianId,

          closedAt:
            null,
        });

      addNotification({
        title:
          "Novo chamado criado",

        message:
          `O chamado #${createdTicket.id} — ${createdTicket.title} foi registrado com prioridade ${createdTicket.priority}.`,

        type:
          "ticket_created",

        severity:
          getNotificationSeverity(),

        read:
          false,

        ticketId:
          createdTicket.id,

        userId:
          user?.id ?? null,
      });

      if (
        selectedTechnicianId !==
        null
      ) {
        const technician =
          technicians.find(
            (currentTechnician) =>
              currentTechnician.id ===
              selectedTechnicianId
          );

        addNotification({
          title:
            "Chamado atribuído",

          message:
            `O chamado #${createdTicket.id} foi atribuído ao técnico ${
              technician?.name ??
              `#${selectedTechnicianId}`
            }.`,

          type:
            "ticket_assigned",

          severity:
            "info",

          read:
            false,

          ticketId:
            createdTicket.id,

          userId:
            selectedTechnicianId,
        });
      }

      showSnackbar(
        "Chamado criado com sucesso.",
        {
          severity:
            "success",
        }
      );

      navigate(
        "/tickets"
      );
    } catch (error) {
      console.error(
        "Não foi possível criar o chamado.",
        error
      );

      setErrorMessage(
        "Não foi possível criar o chamado. Tente novamente."
      );

      showSnackbar(
        "Não foi possível criar o chamado.",
        {
          severity:
            "error",
        }
      );
    } finally {
      setIsSubmitting(
        false
      );
    }
  }

  return (
    <MainLayout title="Abrir chamado">
      <Box
        sx={{
          maxWidth: 900,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 1,
          }}
        >
          Abrir novo chamado
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mb: 3,
          }}
        >
          Preencha as informações abaixo para registrar
          uma nova solicitação.
        </Typography>

        {errorMessage && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
            }}
            onClose={() =>
              setErrorMessage(
                ""
              )
            }
          >
            {errorMessage}
          </Alert>
        )}

        <Paper
          sx={{
            p: {
              xs: 2.5,
              md: 4,
            },
          }}
        >
          <Box
            component="form"
            onSubmit={
              handleSubmit
            }
          >
            <Stack spacing={3}>
              <TextField
                label="Título do chamado"
                placeholder="Exemplo: Impressora não está funcionando"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target
                      .value
                  )
                }
                required
                fullWidth
                disabled={
                  isSubmitting
                }
              />

              <FormControl
                fullWidth
                required
                disabled={
                  isSubmitting
                }
              >
                <InputLabel id="category-label">
                  Categoria
                </InputLabel>

                <Select
                  labelId="category-label"
                  label="Categoria"
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target
                        .value
                    )
                  }
                >
                  <MenuItem value="Hardware">
                    Hardware
                  </MenuItem>

                  <MenuItem value="Software">
                    Software
                  </MenuItem>

                  <MenuItem value="Rede">
                    Rede e internet
                  </MenuItem>

                  <MenuItem value="Acesso">
                    Acesso e permissões
                  </MenuItem>

                  <MenuItem value="Outros">
                    Outros
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                required
                disabled={
                  isSubmitting
                }
              >
                <InputLabel id="priority-label">
                  Prioridade
                </InputLabel>

                <Select
                  labelId="priority-label"
                  label="Prioridade"
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target
                        .value as TicketPriority
                    )
                  }
                >
                  <MenuItem value="Baixa">
                    Baixa
                  </MenuItem>

                  <MenuItem value="Média">
                    Média
                  </MenuItem>

                  <MenuItem value="Alta">
                    Alta
                  </MenuItem>

                  <MenuItem value="Crítica">
                    Crítica
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                disabled={
                  isSubmitting
                }
              >
                <InputLabel id="technician-label">
                  Técnico responsável
                </InputLabel>

                <Select
                  labelId="technician-label"
                  label="Técnico responsável"
                  value={
                    assignedTechnicianId
                  }
                  onChange={(event) =>
                    setAssignedTechnicianId(
                      event.target
                        .value
                    )
                  }
                >
                  <MenuItem
                    value={
                      UNASSIGNED_TECHNICIAN_VALUE
                    }
                  >
                    Não atribuído
                  </MenuItem>

                  {technicians.map(
                    (
                      technician
                    ) => (
                      <MenuItem
                        key={
                          technician.id
                        }
                        value={String(
                          technician.id
                        )}
                      >
                        {
                          technician.name
                        }
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>

              {technicians.length ===
                0 && (
                <Alert severity="info">
                  Não há técnicos ativos cadastrados. O
                  chamado será criado sem técnico
                  responsável.
                </Alert>
              )}

              <TextField
                label="Equipamento"
                placeholder="Exemplo: Notebook Dell patrimônio 1025"
                value={equipment}
                onChange={(event) =>
                  setEquipment(
                    event.target
                      .value
                  )
                }
                fullWidth
                disabled={
                  isSubmitting
                }
              />

              <TextField
                label="Descrição"
                placeholder="Descreva o problema com o máximo de detalhes possível"
                value={
                  description
                }
                onChange={(event) =>
                  setDescription(
                    event.target
                      .value
                  )
                }
                multiline
                rows={6}
                required
                fullWidth
                disabled={
                  isSubmitting
                }
              />

              <Box
                sx={{
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={
                    <SaveIcon />
                  }
                  loading={
                    isSubmitting
                  }
                  disabled={
                    isSubmitting
                  }
                >
                  {isSubmitting
                    ? "Salvando..."
                    : "Salvar chamado"}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </MainLayout>
  );
}

export default CreateTicketPage;