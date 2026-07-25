import { useState } from "react";
import type { FormEvent } from "react";

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

function CreateTicketPage() {
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <MainLayout title="Abrir chamado">
      <Box sx={{ maxWidth: 900 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Abrir novo chamado
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Preencha as informações abaixo para registrar uma nova solicitação.
        </Typography>

        {saved && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Chamado salvo com sucesso.
          </Alert>
        )}

        <Paper sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Título do chamado"
                placeholder="Exemplo: Impressora não está funcionando"
                required
                fullWidth
              />

              <FormControl fullWidth required>
                <InputLabel id="category-label">Categoria</InputLabel>

                <Select
                  labelId="category-label"
                  label="Categoria"
                  defaultValue=""
                >
                  <MenuItem value="hardware">Hardware</MenuItem>
                  <MenuItem value="software">Software</MenuItem>
                  <MenuItem value="network">Rede e internet</MenuItem>
                  <MenuItem value="access">Acesso e permissões</MenuItem>
                  <MenuItem value="other">Outros</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel id="priority-label">Prioridade</InputLabel>

                <Select
                  labelId="priority-label"
                  label="Prioridade"
                  defaultValue=""
                >
                  <MenuItem value="low">Baixa</MenuItem>
                  <MenuItem value="medium">Média</MenuItem>
                  <MenuItem value="high">Alta</MenuItem>
                  <MenuItem value="critical">Crítica</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Equipamento"
                placeholder="Exemplo: Notebook Dell patrimônio 1025"
                fullWidth
              />

              <TextField
                label="Descrição"
                placeholder="Descreva o problema com o máximo de detalhes possível"
                multiline
                rows={6}
                required
                fullWidth
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
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