import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

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
import { createTicket } from "../../services/ticketService";
import type { Ticket } from "../../types/Ticket";

type TicketPriority = Ticket["priority"];

function CreateTicketPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] =
    useState<TicketPriority | "">("");
  const [equipment, setEquipment] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
      return;
    }

    createTicket({
      title: title.trim(),
      category,
      priority,
      status: "Aberto",
    });

    navigate("/tickets");
  }

  return (
    <MainLayout title="Abrir chamado">
      <Box sx={{ maxWidth: 900 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Abrir novo chamado
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Preencha as informações abaixo para registrar uma
          nova solicitação.
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <Paper sx={{ p: 4 }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
          >
            <Stack spacing={3}>
              <TextField
                label="Título do chamado"
                placeholder="Exemplo: Impressora não está funcionando"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                required
                fullWidth
              />

              <FormControl fullWidth required>
                <InputLabel id="category-label">
                  Categoria
                </InputLabel>

                <Select
                  labelId="category-label"
                  label="Categoria"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
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

              <FormControl fullWidth required>
                <InputLabel id="priority-label">
                  Prioridade
                </InputLabel>

                <Select
                  labelId="priority-label"
                  label="Prioridade"
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target.value as TicketPriority
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

              <TextField
                label="Equipamento"
                placeholder="Exemplo: Notebook Dell patrimônio 1025"
                value={equipment}
                onChange={(event) =>
                  setEquipment(event.target.value)
                }
                fullWidth
              />

              <TextField
                label="Descrição"
                placeholder="Descreva o problema com o máximo de detalhes possível"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                multiline
                rows={6}
                required
                fullWidth
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<SaveIcon />}
                >
                  Salvar chamado
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